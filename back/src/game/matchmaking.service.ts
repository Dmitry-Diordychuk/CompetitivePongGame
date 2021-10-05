import {Injectable} from "@nestjs/common";
import {MAX_TIME_IN_QUEUE, POOL_POLL_INTERVAL} from "@app/game/constants";

import {Interval} from "@nestjs/schedule";
import {UserEntity} from "@app/user/user.entity";
import {WsException} from "@nestjs/websockets";

@Injectable()
export class MatchmakingService {
    queue = [];

    AddInQueue(user: UserEntity, socket) {
        if (!this.queue.find(u => u.id === user.id)) {
            user = Object.assign(user, {
                timeAddedInQueue: Date.now(),
                socket: socket,
            });
            this.queue.push(user);
        } else {
            throw new WsException('User already in queue');
        }
    }

    counter = 0
    @Interval(POOL_POLL_INTERVAL)
    matchmaking() {
        if (this.queue.length < 1) {
            return;
        }

        for (const userA of this.queue) {
            for (const userB of this.queue) {
                if (this.isMatch(userA, userB)) {
                    this.queue = this.queue.filter(u => u.id != userA.id && u.id != userB.id);
                    this.makeSession(userA, userB);
                    return;
                } else if (Date.now() - userB.timeAddedInQueue > MAX_TIME_IN_QUEUE) {
                    userB.socket.emit("matchmakingFailed", "Didn't find a match");
                    this.queue = this.queue.filter(u => u.id != userB.id);
                    return;
                }
            }
        }
    }

    isMatch(userA, userB): boolean {
        if (userA !== userB) {
            return Math.abs(userA.profile.level - userB.profile.level) < 2;
        }
        return false;
    }

    makeSession(userA, userB) {
        userA.socket.emit("matchmakingSuccess", {
            roll: "create",
            rival: userB.id
        });
        userB.socket.emit("matchmakingSuccess", {
            roll: "join",
            rival: userA.id
        });
    }
}