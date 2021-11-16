import {Injectable} from "@nestjs/common";
import {FRAME_RATE, GRID_SIZE} from "@app/game/constants";
import {GameStateInterface} from "@app/game/types/gameState.interface";
import {BallInterface} from "@app/game/types/ball.interface";
import {PlayerInterface} from "@app/game/types/player.interface";

@Injectable()
export class GameService {
    state = {};

    startGameInterval(roomName: string, emitStateFunc, emitGameOverFunc) {
        const intervalId = setInterval(() => {
            const winner = this.gameLoop(this.state[roomName]);

            if (!winner) {
                emitStateFunc(this.state[roomName]);
            } else {
                this.state[roomName] = null;
                clearInterval(intervalId);
                emitGameOverFunc(winner);
            }
        }, 1000 / FRAME_RATE)
        return;
    }

    initGame(roomName: string) {
        this.state[roomName] = this.createGameState();
    }

    createGameState(): GameStateInterface {
        return {
            players: [{
                pos: {
                    x: 1,
                    y: 5,
                },
                vel: 0,
                size: 5,
            }, {
                pos: {
                    x: 18,
                    y: 5,
                },
                vel: 0,
                size: 5,
            }],
            ball: {
                pos: {
                    x: 2,
                    y: 5,
                },
                vel: {
                    x: 1,
                    y: 1,
                }
            },
            gridSize: GRID_SIZE,
        }
    }

    gameLoop(state: GameStateInterface): 2 | 1 | false {
        if (!state) {
            return;
        }

        const playerOne = state.players[0];
        if (playerOne.pos.y + playerOne.vel >= 0 && playerOne.pos.y + playerOne.size + playerOne.vel <= GRID_SIZE) {
            playerOne.pos.y += playerOne.vel;
            playerOne.vel = 0;
        }

        const playerTwo = state.players[1];
        if (playerTwo.pos.y + playerTwo.vel >= 0 && playerTwo.pos.y + playerTwo.size + playerTwo.vel <= GRID_SIZE) {
            playerTwo.pos.y += playerTwo.vel;
            playerTwo.vel = 0;
        }

        const ball = state.ball;

        if (ball.pos.y + ball.vel.y < 0 || ball.pos.y + ball.vel.y > GRID_SIZE - 1) {
            ball.vel.y *= -1;
        }

        if (this.isBallCollideWithRacket(ball, playerOne) || this.isBallCollideWithRacket(ball, playerTwo)) {
            ball.vel.x *= -1;
        }

        ball.pos.x += ball.vel.x;
        ball.pos.y += ball.vel.y;

        if (ball.pos.x < 0) {
            return 2;
        } else if (ball.pos.x > GRID_SIZE) {
            return 1;
        }
        return false;
    }

    isBallCollideWithRacket(ball: BallInterface, racket: PlayerInterface): boolean {
        let ballNextPosition = {
            x: ball.pos.x + ball.vel.x,
            y: ball.pos.y + ball.vel.y,
        }

        for (let i = 0; i < racket.size; i++) {
            if (ballNextPosition.x === racket.pos.x && ballNextPosition.y === racket.pos.y + i) {
                return true;
            }
        }
        return false;
    }

    getUpdatedVelocity(keyCode: number): 1 | -1 {
        switch (keyCode) {
            case 38: {
                return -1;
            }
            case 40: {
                return 1;
            }
        }
    }

    setPlayerVelocity(roomName: string, playerNumber: 2 | 1, velocity: number) {
        this.state[roomName].players[playerNumber - 1].vel = velocity;
    }

    makeId(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}