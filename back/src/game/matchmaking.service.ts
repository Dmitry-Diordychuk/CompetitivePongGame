import {Injectable} from "@nestjs/common";
import {MAX_TIME_IN_QUEUE, POOL_POLL_INTERVAL, WAIT_FOR_PLAYERS_INTERVAL} from "@app/game/constants";

import {Interval, SchedulerRegistry} from "@nestjs/schedule";
import {UserEntity} from "@app/user/user.entity";
import {WsException} from "@nestjs/websockets";

@Injectable()
export class MatchmakingService {
    constructor(private schedulerRegistry: SchedulerRegistry) {}
    queue = [];
    waitList = [];

    addInQueue(user: UserEntity, socket) {
        if (!this.queue.find(u => u.id === user.id)) {
            const data = Object.assign(user, {
                timeAddedInQueue: Date.now(),
                socket: socket,
                isAccept: false,
            });
            this.queue.push(data);
        } else {
            throw new WsException('User already in queue');
        }
    }

    leaveQueue(user: UserEntity) {
        if (this.queue.find(u => u.id === user.id)) {
            this.queue = this.queue.filter(u => u.id !== user.id);
        } else {
            throw new WsException("User isn't in queue");
        }
    }


    @Interval(POOL_POLL_INTERVAL)
    matchmaking() {
        if (this.queue.length < 1) {
            return;
        }

        for (const userA of this.queue) {
            let timeSinceStart = 0;
            for (const userB of this.queue) {
                if (this.isMatch(userA, userB)) {
                    this.queue = this.queue.filter(u => u.id != userA.id && u.id != userB.id);

                    const timeout = setTimeout(() => {
                        this.schedulerRegistry.deleteTimeout(`wait_for_${userA.id}_${userB.id}`);
                        this.schedulerRegistry.deleteInterval(`timer_${userA.id}_${userB.id}`);
                        userA.socket.emit('wait-for-players-timer', 10000);
                        userB.socket.emit('wait-for-players-timer', 10000);
                    }, WAIT_FOR_PLAYERS_INTERVAL);
                    this.schedulerRegistry.addTimeout(`wait_for_${userA.id}_${userB.id}`, timeout);

                    const startTime = Date.now()
                    const interval = setInterval(() => {
                        const time = Date.now() - startTime;
                        userA.socket.emit('wait-for-players-timer', time);
                        userB.socket.emit('wait-for-players-timer', time);
                    }, 1000)
                    this.schedulerRegistry.addInterval(`timer_${userA.id}_${userB.id}`, interval);

                    this.waitList.push({
                        userA: userA,
                        userB: userB,
                        timeout: `wait_for_${userA.id}_${userB.id}`,
                        interval: `timer_${userA.id}_${userB.id}`,
                    })

                    this.queue = this.queue.filter(u => u.id !== userA && u.id !== userB.id);
                    userA.socket.emit('matchmaking-success');
                    userB.socket.emit('matchmaking-success');

                    return;
                }
                timeSinceStart = Date.now() - userB.timeAddedInQueue;
                if (timeSinceStart > MAX_TIME_IN_QUEUE) {
                    userB.socket.emit("matchmaking-failed", "Didn't find a match");
                    this.queue = this.queue.filter(u => u.id != userB.id);
                    return;
                }
            }
            userA.socket.emit("matchmaking-wait", timeSinceStart);
        }
    }

    isMatch(userA, userB): boolean {
        if (userA !== userB) {
            return Math.abs(userA.profile.level - userB.profile.level) < 2;
        }
        return false;
    }


    updateSocketIfUserInQueue(user, socket) {
        const data = this.queue.find(d => d.id === user.id);
        if (!data) {
            return;
        }
        data.socket = socket;
    }

    acceptGame(user) {
        const players = this.waitList.find(i => i.userA.id === user.id || i.userB.id === user.id);
        if (players.userA.id === user.id) {
            players.userA.isAccept = true;
        } else if (players.userB.id === user.id) {
            players.userB.isAccept = true;
        }
        if (players.userA.isAccept && players.userB.isAccept) {
            this.schedulerRegistry.deleteTimeout(players.timeout);
            this.schedulerRegistry.deleteInterval(players.interval);
            this.waitList = this.waitList.filter(i => i !== players);
            return {
                userA: players.userA,
                userB: players.userB,
            }
        }
        return null;
    }

    makeSession(userA, userB) {
        userA.socket.emit("create", {
            roll: "create",
            rival: userB.id
        });
        userB.socket.emit("join", {
            roll: "join",
            rival: userA.id
        });
    }

    // TODO: match decline
    declineGame(user) {

    }
}