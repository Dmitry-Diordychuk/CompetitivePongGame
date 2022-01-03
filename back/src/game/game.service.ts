import {Injectable} from "@nestjs/common";
import {BONUS_LIFETIME, BONUSES, FRAME_RATE, GRID_SIZE} from "@app/game/constants";
import {GameStateInterface} from "@app/game/types/gameState.interface";
import {BallInterface} from "@app/game/types/ball.interface";
import {PlayerRacketInterface} from "@app/game/types/playerRacketInterface";
import {Server} from "socket.io";
import {ClientInfoService} from "@app/matchmaking/clientInfo.service";
import {WsException} from "@nestjs/websockets";
import {Interval, SchedulerRegistry} from "@nestjs/schedule";

@Injectable()
export class GameService {
    constructor(
        private readonly clientInfoService: ClientInfoService,
        private schedulerRegistry: SchedulerRegistry,
    ) {
    }
    state = {};

    // @Interval(10000)
    // log() {
    //     console.log('Games');
    //     console.log(this.state);
    // }

    initGame(roomName: string) {
        this.state[roomName] = this.createInitialGameState();
    }

    startGameInterval(server: Server, roomName: string, callback, mode : 'default' | 'modded' = 'default') {
        let clients = server.sockets.adapter.rooms.get(roomName);

        let playerOne = null;
        let playerTwo = null;
        for (let socketId of clients) {
            let player = this.clientInfoService.getClientInfo(socketId);
            if (player.playerNumber === 1) {
                playerOne = player;
            } else if (player.playerNumber === 2) {
                playerTwo = player;
            }
        }

        const intervalId = setInterval(() => {
            clients = server.sockets.adapter.rooms.get(roomName);

            if (this.state[roomName].playerSurrendered === 1) {
                this.gameOver(server, roomName, 2, callback);
            } else if (this.state[roomName].playerSurrendered === 2) {
                this.gameOver(server, roomName, 1, callback);
            }

            if (!clients && Date.now() - this.state[roomName].pauseStartTime > 900000) {
                if (
                    this.state[roomName].roundResult.filter(x => x === 1).length >
                    this.state[roomName].roundResult.filter(x => x === 2).length
                )
                    this.gameOver(server, 0, 1, ()=>{});
                else
                    this.gameOver(server, 0, 2, ()=>{});
            }

            if (!this.state[roomName]?.pause) {
                if (!clients?.has(playerOne.socketId)) {
                    if (this.state[roomName].pause === false) {
                        this.state[roomName].pause = true;
                        this.state[roomName].pauseStartTime = new Date();
                        if (this.state[roomName].pausePlayerOneCounter > 0) // MAX_PAUSES
                        {
                            this.gameOver(server, roomName, 2, callback);
                            return;
                        }
                        this.state[roomName].pausePlayerOneCounter += 1;
                    }
                    return;
                } else if (!clients?.has(playerTwo.socketId)) {
                    if (this.state[roomName].pause === false) {
                        this.state[roomName].pause = true;
                        this.state[roomName].pauseStartTime = new Date();
                        if (this.state[roomName].pausePlayerTwoCounter > 0) // MAX_PAUSES
                        {
                            this.gameOver(server, roomName, 1, callback);
                            return;
                        }
                        this.state[roomName].pausePlayerTwoCounter += 1;
                    }
                    return;
                }
            } else if (this.state[roomName].pause) {
                if (Date.now() - this.state[roomName].pauseStartTime > 30000) {
                    this.state[roomName].pause = false;
                    if (this.state[roomName].pausePlayerOneCounter > 0) // IF_DISCONNECTED
                        this.gameOver(server, roomName, 2, callback);
                    else if (this.state[roomName].pausePlayerTwoCounter > 0) // IF_DISCONNECTED
                        this.gameOver(server, roomName, 1, callback);
                } else if (clients?.has(playerOne.socketId) && clients?.has(playerTwo.socketId)) {
                    this.state[roomName].pause = false;
                }
                if (clients) {
                    for (let socketId of clients) {
                        server.sockets.sockets.get(socketId).emit('game-state', JSON.stringify(this.state[roomName]));
                    }
                }
                return;
            }

            let winner = this.gameLoop(this.state[roomName], mode);
            if (!winner && clients) {
                for (let socketId of clients) {
                    server.sockets.sockets.get(socketId).emit('game-state', JSON.stringify(this.state[roomName]));
                }
            } else if (winner) {
                this.state[roomName].roundCounter++;
                this.state[roomName].roundResult.push(winner);
                this.state[roomName] = this.resetGameState(this.state[roomName], this.state[roomName].roundCounter % 2);

                if (
                    this.state[roomName].roundResult.filter(x => x === 1).length === 3
                    || this.state[roomName].roundResult.filter(x => x === 2).length === 3
                ) {
                    if (this.state[roomName].roundResult.filter(winner => winner === 1).reduce((accumulator) => accumulator + 1) > 2)
                        winner = 1;
                    else
                        winner = 2;
                    this.gameOver(server, roomName, winner, callback);
                }
            }
        }, 1000 / FRAME_RATE)
        this.schedulerRegistry.addInterval(roomName, intervalId);
    }

    gameOver(server, roomName, winner, callback) {
        this.state[roomName] = null;
        this.schedulerRegistry.deleteInterval(roomName);
        server.sockets.in(roomName).emit('game-over', JSON.stringify({winner}));
        this.clientInfoService.removeClientInfo(roomName);
        delete this.state[roomName];
        callback(winner);
    }

    // inverseState(playerTwoSocketId, socketId, gameState) {
    //     const state = Object.assign({}, gameState);
    //     if (playerTwoSocketId === socketId) {
    //         state.players = [state.players[1], state.players[0]];
    //         return (state);
    //     } else {
    //         return (state);
    //     }
    // }

    resetGameState(state: GameStateInterface, ballPosition: number): GameStateInterface {
        state.players = [{
            position: {
                x: 1,
                y: 5,
            },
            velocity: 0,
            size: 9,
        }, {
            position: {
                x: GRID_SIZE - 2,
                y: 5,
            },
            velocity: 0,
            size: 9,
        }]
        if (ballPosition === 0)
            state.ball = {
                position: {
                    x: 1,
                    y: 7,
                },
                velocity: {
                    x: 1,
                    y: Math.random() < 0.5 ? -1 : 1,
                }
            }
        else
            state.ball = {
                position: {
                    x: GRID_SIZE - 2,
                    y: 7,
                },
                velocity: {
                    x: -1,
                    y: Math.random() < 0.5 ? -1 : 1,
                }
            }
        state.bonus = null;
        state.active = [];

        return (state);
    }

    createInitialGameState(): GameStateInterface {
        return {
            players: [{
                position: {
                    x: 1,
                    y: 5,
                },
                velocity: 0,
                size: 9,
            }, {
                position: {
                    x: GRID_SIZE - 2,
                    y: 5,
                },
                velocity: 0,
                size: 9,
            }],
            ball: {
                position: {
                    x: 1,
                    y: 7,
                },
                velocity: {
                    x: 1,
                    y: Math.random() < 0.5 ? -1 : 1,
                }
            },
            gridSize: GRID_SIZE,

            roundCounter: 0,
            roundResult: [],

            bonus: null,
            active: [],

            pause: false,
            pauseStartTime: Date.now(),
            pausePlayerOneCounter: 0,
            pausePlayerTwoCounter: 0,
            playerSurrendered: false,
        }
    }

    gameLoop(state: GameStateInterface, mode: 'default' | 'modded'): 2 | 1 | false {
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

        if (mode === 'modded') {
            state.active.map(bonus => {
                if (bonus.type === 'wall' && this.isBallCollideWithRacket(ball, bonus.wall)) {
                    ball.velocity.x *= -1;
                } else if (bonus.type === 'freeze') {
                    ball.velocity.x = 0;
                    ball.velocity.y = 0;
                } else if (bonus.type === 'speed') {
                    if (ball.velocity.x === 1 || ball.velocity.x === -1) {
                        ball.velocity.x *= 2;
                        ball.velocity.y *= 2;
                    }
                } else if (bonus.type === 'shake') {
                    ball.velocity.y *= -1;
                }
                bonus.lifetime--;
                if (bonus.lifetime === 0) {
                    if (bonus.type === 'freeze') {
                        ball.velocity.x = Math.random() > 0.5 ? 1 : -1;
                        ball.velocity.y = Math.random() > 0.5 ? 1 : -1;
                    } else if (bonus.type === 'speed') {
                        ball.velocity.x /= 2;
                        ball.velocity.y /= 2;
                    }
                }
            });
            state.active = state.active.filter(bonus => bonus.lifetime !== 0);

            if (state.bonus) {
                if (ball.position.x >= state.bonus.position.x - 1 && ball.position.x <= state.bonus.position.x + 1
                    && ball.position.y >= state.bonus.position.y - 1 && ball.position.y <= state.bonus.position.y + 1
                ) {
                    let position = null;
                    let lifetime = 10;
                    if (state.bonus.type === 'wall') {
                        position = {
                            x: Math.floor(GRID_SIZE / 2),
                            y: Math.floor(Math.random() * GRID_SIZE - 7),
                        }
                        lifetime = 100;
                    }
                    state.active.push({
                        type: state.bonus.type,
                        lifetime: lifetime,
                        wall: {
                            position: position,
                            size: 7,
                            velocity: 0.
                        }
                    })
                    state.bonus = null;
                }
            }

            if (state.bonus) {
                state.bonus.lifetime--;
                if (state.bonus.lifetime === 0)
                    state.bonus = null;
            }

            if (!state.bonus && Math.floor(Math.random() * 10) === 0) {
                let bonus_x = Math.floor(Math.random() * (GRID_SIZE - 5) + 3);
                let bonus_y = Math.floor(Math.random() * GRID_SIZE)
                if ((bonus_x < ball.position.x - 1  || bonus_x > ball.position.x + 1)
                    && (bonus_y < ball.position.y - 1 || bonus_y > ball.position.y + 1)
                ) {
                    state.bonus = {
                        position: {
                            x: bonus_x,
                            y: bonus_y,
                        },
                        type: BONUSES[Math.floor(Math.random() * BONUSES.length)],
                        lifetime: BONUS_LIFETIME,
                    }
                }

            }
        }

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
            if (Math.abs(ball.velocity.x) > 1) {
                if (ballNextPosition.x === racket.position.x + 1 && ballNextPosition.y === racket.position.y + i) {
                    return true;
                }
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
        if (this.state[roomName])
            this.state[roomName].players[playerNumber - 1].velocity = velocity;
        else {
            throw new WsException('Game is over!');
        }
    }

    giveUp(roomName: string, playerNumber: 1 | 2) {
        if (this.state[roomName])
            this.state[roomName].playerSurrendered = playerNumber;
        else {
            throw new WsException('Game is over!');
        }
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