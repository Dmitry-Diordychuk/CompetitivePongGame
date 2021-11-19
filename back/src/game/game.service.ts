import {Injectable} from "@nestjs/common";
import {FRAME_RATE, GRID_SIZE} from "@app/game/constants";
import {GameStateInterface} from "@app/game/types/gameState.interface";
import {BallInterface} from "@app/game/types/ball.interface";
import {PlayerRacketInterface} from "@app/game/types/playerRacketInterface";

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
        this.state[roomName] = this.createInitialGameState();
    }

    createInitialGameState(): GameStateInterface {
        return {
            players: [{
                position: {
                    x: 1,
                    y: 5,
                },
                velocity: 0,
                size: 5,
            }, {
                position: {
                    x: 18,
                    y: 5,
                },
                velocity: 0,
                size: 5,
            }],
            ball: {
                position: {
                    x: 2,
                    y: 5,
                },
                velocity: {
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
        if (playerOne.position.y + playerOne.velocity >= 0 && playerOne.position.y + playerOne.size + playerOne.velocity <= GRID_SIZE) {
            playerOne.position.y += playerOne.velocity;
            playerOne.velocity = 0;
        }

        const playerTwo = state.players[1];
        if (playerTwo.position.y + playerTwo.velocity >= 0 && playerTwo.position.y + playerTwo.size + playerTwo.velocity <= GRID_SIZE) {
            playerTwo.position.y += playerTwo.velocity;
            playerTwo.velocity = 0;
        }

        const ball = state.ball;

        if (ball.position.y + ball.velocity.y < 0 || ball.position.y + ball.velocity.y > GRID_SIZE - 1) {
            ball.velocity.y *= -1;
        }

        if (this.isBallCollideWithRacket(ball, playerOne) || this.isBallCollideWithRacket(ball, playerTwo)) {
            ball.velocity.x *= -1;
        }

        ball.position.x += ball.velocity.x;
        ball.position.y += ball.velocity.y;

        if (ball.position.x < 0) {
            return 2;
        } else if (ball.position.x > GRID_SIZE) {
            return 1;
        }
        return false;
    }

    isBallCollideWithRacket(ball: BallInterface, racket: PlayerRacketInterface): boolean {
        let ballNextPosition = {
            x: ball.position.x + ball.velocity.x,
            y: ball.position.y + ball.velocity.y,
        }

        for (let i = 0; i < racket.size; i++) {
            if (ballNextPosition.x === racket.position.x && ballNextPosition.y === racket.position.y + i) {
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
        this.state[roomName].players[playerNumber - 1].velocity = velocity;
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