import {Injectable} from "@nestjs/common";
import {MAX_TIME_IN_QUEUE, POOL_POLL_INTERVAL} from "@app/game/constants";

import {Interval} from "@nestjs/schedule";
import {UserEntity} from "@app/user/user.entity";
import {WsException} from "@nestjs/websockets";

@Injectable()
export class MatchmakingService {
    queue = [];

    AddInQueue(user: UserEntity) {
        if (!this.queue.find(u => u.id === user.id)) {
            user = Object.assign(user, {timeAddedInQueue: Date.now()})
            this.queue.push(user);
        } else {
            throw new WsException('User already in queue');
        }
    }

    counter = 0
    @Interval(POOL_POLL_INTERVAL)
    matchmaking() {
        console.log(this.counter++);
        console.log('[');
        for (const user of this.queue)
            console.log('\t', user.username);
        console.log(']');

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
                    console.log(`${userB.username} didn't find a match`);
                    this.queue = this.queue.filter(u => u.id != userB.id);
                    return;
                }
            }
        }
    }

    isMatch(userA, userB): boolean {
        if (userA !== userB) {
            if (Math.abs(userA.profile.level - userB.profile.level) < 2) {
                return true;
            }
            return false;
        }
        return false;
    }

    makeSession(userA, userB) {
        console.log(`${userA.username} matched with ${userB.username}`)
    }
}