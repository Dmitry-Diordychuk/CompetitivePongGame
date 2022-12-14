import {Injectable} from "@nestjs/common";
import {MAX_TIME_IN_QUEUE, POOL_POLL_INTERVAL, WAIT_FOR_PLAYERS_INTERVAL} from "@app/game/constants";

import {Interval, SchedulerRegistry} from "@nestjs/schedule";
import {UserEntity} from "@app/user/user.entity";
import {WsException} from "@nestjs/websockets";
import {GameClientInterface} from "@app/matchmaking/types/gameClient.interface";
import {ClientPairInterface} from "@app/matchmaking/types/clientPair.interface";
import {Socket} from "socket.io";
import {queue} from "rxjs";

@Injectable()
export class MatchmakingService {
    constructor(
        private schedulerRegistry: SchedulerRegistry,
    ) {}

    queue: GameClientInterface[] = [];
    waitList: ClientPairInterface[] = [];
    waitDuel: ClientPairInterface[] = [];

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


    createWaitForPlayersTimer(clientA: GameClientInterface, clientB: GameClientInterface, event: string, cleanUp: any): {
        IntervalFunctionName: string,
        TimeoutFunctionName: string
    } {
        const intervalFunctionName: string = `timer_${clientA.user.id}_${clientB.user.id}`;
        const timeoutFunctionName: string = `wait_for_${clientA.user.id}_${clientB.user.id}`;

        const startTime = Date.now()
        const interval = setInterval(() => {
            const time = Date.now() - startTime;
            clientA.socket.emit(event, time);
            clientB.socket.emit(event, time);
        }, 1000)
        this.schedulerRegistry.addInterval(intervalFunctionName, interval);

        const timeout = setTimeout(() => {
            this.schedulerRegistry.deleteInterval(intervalFunctionName);
            clientA.socket.emit(event, 10000);
            clientB.socket.emit(event, 10000);
            cleanUp();
            this.schedulerRegistry.deleteTimeout(timeoutFunctionName);
        }, WAIT_FOR_PLAYERS_INTERVAL);
        this.schedulerRegistry.addTimeout(timeoutFunctionName, timeout);

        return {
            IntervalFunctionName: intervalFunctionName,
            TimeoutFunctionName: timeoutFunctionName,
        }
    }


    successMatchmakingHandle(clientA: GameClientInterface, clientB: GameClientInterface) {
        this.queue = this.queue.filter(client => client.user.id != clientA.user.id && client.user.id != clientB.user.id);

        const functionsNames = this.createWaitForPlayersTimer(clientA, clientB, 'matchmaking-wait-for-players', ()=>{
            this.waitList = this.waitList.filter(i => i.clientA.user.id !== clientA.user.id);
        });

        this.waitList.push({
            clientA: clientA,
            clientB: clientB,
            timeoutFunctionName: functionsNames.TimeoutFunctionName,
            intervalFunctionName: functionsNames.IntervalFunctionName,
            gameMode: 'default',
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
            return Math.abs(clientA.user.profile.level - clientB.user.profile.level) < 11;
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
        if (!pair) {
            return ;
        }
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
            ???????????????? ?????????? ???????? ???????????????????????? ??????????????????.
         */
        const data = this.queue.find(client => client.user.id === user.id);
        if (!data) {
            return;
        }
        data.socket = socket;
    }

    inviteToDuel(user: UserEntity, socket, rival: UserEntity, rivalSocket: Socket, gameMode: 'default' | 'modded') {
        const currentClient: GameClientInterface = {
            user: user,
            queueEntryTime: Date.now(),
            socket: socket,
            isGameAccepted: true,
        }

        const rivalClient: GameClientInterface = {
            user: rival,
            queueEntryTime: Date.now(),
            socket: rivalSocket,
            isGameAccepted: false,
        }

        if (user.id === rival.id) {
            throw new WsException("You can't invite yourself!");
        }

        const timeoutFunctionName: string = `wait_for_${user.id}_${rival.id}`;

        const timeouts = this.schedulerRegistry.getTimeouts();
        timeouts.forEach(key => {
            if (key === `wait_for_${user.id}_${rival.id}`) {
                throw new WsException("You have already invited this player!");
            } else if (key == `wait_for_${rival.id}_${user.id}`) {
                throw new WsException('You have already been invited!');
            }
        })

        const functionsNames = this.createWaitForPlayersTimer(currentClient, rivalClient, 'duel-wait-for-players', () => {
            this.waitDuel = this.waitDuel.filter(i => i.clientA.user.id !== user.id);
        });

        this.waitDuel.push({
            clientA: currentClient,
            clientB: rivalClient,
            timeoutFunctionName: functionsNames.TimeoutFunctionName,
            intervalFunctionName: functionsNames.IntervalFunctionName,
            gameMode: gameMode,
        })
    }

    acceptDuel(user: UserEntity, rivalId: number) {
        const pair = this.waitDuel.find(duel => duel.clientA.user.id === rivalId && duel.clientB.user.id === user.id);
        if (!pair) {
            throw new WsException("The is no such invite");
        }
        this.schedulerRegistry.deleteTimeout(pair.timeoutFunctionName);
        this.schedulerRegistry.deleteInterval(pair.intervalFunctionName);
        this.waitDuel = this.waitDuel.filter(duel => duel.clientB.user.id !== user.id);
        return pair;
    }

    declineDuel(user: UserEntity, rivalId: number) {
        const pair = this.waitDuel.find(duel => duel.clientA.user.id === rivalId && duel.clientB.user.id === user.id);
        if (!pair) {
            throw new WsException("The is no such invite");
        }
        const rivalSocketId = pair.clientA.socket.id;
        this.schedulerRegistry.deleteTimeout(pair.timeoutFunctionName);
        this.schedulerRegistry.deleteInterval(pair.intervalFunctionName);
        this.waitDuel = this.waitDuel.filter(duel => duel.clientB.user.id !== user.id);
        return rivalSocketId;
    }
}