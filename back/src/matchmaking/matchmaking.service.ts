import {Injectable} from "@nestjs/common";
import {MAX_TIME_IN_QUEUE, POOL_POLL_INTERVAL, WAIT_FOR_PLAYERS_INTERVAL} from "@app/game/constants";

import {Interval, SchedulerRegistry} from "@nestjs/schedule";
import {UserEntity} from "@app/user/user.entity";
import {WsException} from "@nestjs/websockets";
import {GameClientInterface} from "@app/matchmaking/types/gameClient.interface";
import {ClientPairInterface} from "@app/matchmaking/types/clientPair.interface";
import {Socket} from "socket.io";

@Injectable()
export class MatchmakingService {
    constructor(private schedulerRegistry: SchedulerRegistry) {}

    queue: GameClientInterface[] = [];
    waitList: ClientPairInterface[] = [];

    addInQueue(user: UserEntity, socket) {
        if (!this.queue.find(client => client.user.id === user.id)) {
            const gameClient: GameClientInterface = {
                user: user,
                queueEntryTime: Date.now(),
                socket: socket,
                isGameAccepted: false,
            }
            this.queue.push(gameClient);
        } else {
            throw new WsException('User already in queue');
        }
    }


    leaveQueue(user: UserEntity) {
        this.queue = this.queue.filter(client => client.user.id !== user.id);
    }


    createWaitForPlayersTimer(clientA: GameClientInterface, clientB: GameClientInterface): {
        IntervalFunctionName: string,
        TimeoutFunctionName: string
    } {
        const intervalFunctionName: string = `timer_${clientA.user.id}_${clientB.user.id}`;
        const timeoutFunctionName: string = `wait_for_${clientA.user.id}_${clientB.user.id}`;

        const startTime = Date.now()
        const interval = setInterval(() => {
            const time = Date.now() - startTime;
            clientA.socket.emit('matchmaking-wait-for-players', time);
            clientB.socket.emit('matchmaking-wait-for-players', time);
        }, 1000)
        this.schedulerRegistry.addInterval(intervalFunctionName, interval);

        const timeout = setTimeout(() => {
            this.schedulerRegistry.deleteTimeout(intervalFunctionName);
            this.schedulerRegistry.deleteInterval(timeoutFunctionName);
            clientA.socket.emit('matchmaking-wait-for-players', 10000);
            clientB.socket.emit('matchmaking-wait-for-players', 10000);
        }, WAIT_FOR_PLAYERS_INTERVAL);
        this.schedulerRegistry.addTimeout(timeoutFunctionName, timeout);

        return {
            IntervalFunctionName: intervalFunctionName,
            TimeoutFunctionName: timeoutFunctionName,
        }
    }


    successMatchmakingHandle(clientA: GameClientInterface, clientB: GameClientInterface) {
        this.queue = this.queue.filter(client => client.user.id != clientA.user.id && client.user.id != clientB.user.id);

        const functionsNames = this.createWaitForPlayersTimer(clientA, clientB);

        this.waitList.push({
            clientA: clientA,
            clientB: clientB,
            timeoutFunctionName: functionsNames.TimeoutFunctionName,
            intervalFunctionName: functionsNames.IntervalFunctionName,
        })

        this.queue = this.queue.filter(
            client => client.user.id !== clientA.user.id
                && client.user.id !== clientB.user.id
        );

        clientA.socket.emit('matchmaking-success');
        clientB.socket.emit('matchmaking-success');
    }


    @Interval(POOL_POLL_INTERVAL)
    loopMatchmaking() {
        for (const clientA of this.queue) {
            let timeSinceStart = 0;
            for (const clientB of this.queue) {
                if (this.isMatch(clientA, clientB)) {
                    this.successMatchmakingHandle(clientA, clientB);
                    return;
                }
                timeSinceStart = Date.now() - clientB.queueEntryTime;
                if (timeSinceStart > MAX_TIME_IN_QUEUE) {
                    clientB.socket.emit("matchmaking-failed", "Didn't find a match");
                    this.queue = this.queue.filter(client => client.user.id != clientB.user.id);
                    return;
                }
                clientA.socket.emit("matchmaking-time", timeSinceStart);
            }
        }
    }

    /*
        How to match two players
     */
    isMatch(clientA: GameClientInterface, clientB: GameClientInterface): boolean {
        if (clientA !== clientB) {
            return Math.abs(clientA.user.profile.level - clientB.user.profile.level) < 2;
        }
        return false;
    }


    acceptGame(user): ClientPairInterface | null  {
        const pair: ClientPairInterface = this.waitList.find(pair => pair.clientA.user.id === user.id || pair.clientB.user.id === user.id);
        if (pair.clientA.user.id === user.id) {
            pair.clientA.isGameAccepted = true;
        } else if (pair.clientB.user.id === user.id) {
            pair.clientB.isGameAccepted = true;
        }
        if (pair.clientA.isGameAccepted && pair.clientB.isGameAccepted) {
            this.schedulerRegistry.deleteTimeout(pair.timeoutFunctionName);
            this.schedulerRegistry.deleteInterval(pair.intervalFunctionName);
            this.waitList = this.waitList.filter(i => i !== pair);
            return pair;
        }
        return null;
    }


    removeFromWaitList(user): Socket {
        const pair = this.waitList.find(pair => pair.clientA.user.id === user.id || pair.clientB.user.id === user.id);
        this.schedulerRegistry.deleteTimeout(pair.timeoutFunctionName);
        this.schedulerRegistry.deleteInterval(pair.intervalFunctionName);
        this.waitList = this.waitList.filter(pair => pair.clientA.user.id !== user.id && pair.clientB.user.id !== user.id);
        if (pair.clientA.user === user) {
            return pair.clientB.socket;
        } else {
            return pair.clientA.socket;
        }
    }


    updateSocketIfUserInQueue(user, socket) {
        /*
            Обновить сокет если пользователь перезашел.
         */
        const data = this.queue.find(client => client.user.id === user.id);
        if (!data) {
            return;
        }
        data.socket = socket;
    }
}