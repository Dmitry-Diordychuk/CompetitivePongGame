import {Injectable} from "@nestjs/common";
import {BONUS_LIFETIME, BONUSES, FRAME_RATE, GRID_SIZE} from "@app/game/constants";
import {GameStateInterface} from "@app/game/types/gameState.interface";
import {BallInterface} from "@app/game/types/ball.interface";
import {PlayerRacketInterface} from "@app/game/types/playerRacketInterface";
import {Server} from "socket.io";
import {ClientInfoService} from "@app/clientInfo/clientInfo.service";
import {WsException} from "@nestjs/websockets";
import {SchedulerRegistry} from "@nestjs/schedule";
import {PositionInterface} from "@app/game/types/position.interface";
@Injectable() 
export class GameService {
    constructor(
        private readonly clientInfoService: ClientInfoService,
        private schedulerRegistry: SchedulerRegistry,
    ) {
    }
    state = {};


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
                    if (this.state[roomName].roundResult.filter(winner => winner === 1).length > 2)
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
        this.clientInfoService.destroyRoom(roomName);
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
                x: GRID_SIZE  - 2,
                y: 5,
            },
            velocity: 0,
            size: 9,
        }]
        if (ballPosition === 0)
            state.ball = {
                position: {
                    x: 21,
                    y: 19,
                },
                velocity: {
                    x: 1,
                    y: Math.random() < 0.5 ? -0.25 : 0.25,
                }
            }
        else
            state.ball = {
                position: {
                    x: 21,
                    y: 19,
                },
                velocity: {
                    x: -(1),
                    y: Math.random() < 0.5 ? -0.25 : 0.25,
                }
            }
        state.bonus = null;
        state.active = [];
        state.step = 0;
      
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
                    x: GRID_SIZE  - 2,
                    y: 5,
                },
                velocity: 0,
                size: 9,
            }],
            ball: {
                position: {
                    x: 19,
                    y: 21,
                },
                velocity: {
                    x: 1,
                    y: Math.random() < 0.5 ? -0.25 : 0.25,
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
            step : 0
        }
    }

    gameLoop(state: GameStateInterface, mode: 'default' | 'modded'): 2 | 1 | false {
        if (!state) {
            return;
        }

        const playerOne = state.players[0];
        if (playerOne.position.y + playerOne.velocity >= 3 && playerOne.position.y + playerOne.size + playerOne.velocity <= GRID_SIZE) {
            playerOne.position.y += playerOne.velocity;
            playerOne.velocity = 0;
        }

        const playerTwo = state.players[1];
        if (playerTwo.position.y + playerTwo.velocity >= 3 && playerTwo.position.y + playerTwo.size + playerTwo.velocity <= GRID_SIZE) {
            playerTwo.position.y += playerTwo.velocity;
            playerTwo.velocity = 0;
        }

        const ball = state.ball;
        let speed = 7 - (~~(state.step / 1000));
        
        if (speed === 0 || state.step % speed === 0)
        {
        if ((ball.position.y + ball.velocity.y) < 0 || (ball.position.y + ball.velocity.y) > GRID_SIZE) {
                ball.velocity.y *= -1;
        }
        const playerOneCollideResult = this.isBallCollideWithRacket(ball, playerOne);
        
        if (playerOneCollideResult === '1') 
        {
            ball.velocity = this.letsTry(ball, 1, 1);
        } else if (playerOneCollideResult === '2')
            ball.velocity = this.letsTry(ball, 2, 1);
        else if (playerOneCollideResult === '3' ) {
            ball.velocity = this.letsTry(ball, 3, 1);
        } else if (playerOneCollideResult === '4') {
            ball.velocity = this.letsTry(ball, 4, 1);
        } else if (playerOneCollideResult === '5') {
            ball.velocity = this.letsTry(ball, 4, -1.2);
        } else if (playerOneCollideResult === '6') {
            ball.velocity = this.letsTry(ball, 3, -1.2);
        } else if (playerOneCollideResult === '7') {
            ball.velocity = this.letsTry(ball, 2, -1.2);
        } else if (playerOneCollideResult === '8') {
            ball.velocity = this.letsTry(ball, 1, -1.2);
        } else if (playerOneCollideResult === '9') {
            ball.velocity = this.letsTry(ball, 1, -1.2);
        }
        

        const playerTwoCollideResult = this.isBallCollideWithRacket(ball, playerTwo);
        if (playerTwoCollideResult === '1') {
            ball.velocity = this.letsTry(ball, -1, 1)
        } else if (playerTwoCollideResult === '2')
            ball.velocity = this.letsTry(ball, -2, 1)
        else if (playerTwoCollideResult === '3') {
            ball.velocity = this.letsTry(ball, -3, 1)
        } else if (playerTwoCollideResult === '4') {
            ball.velocity = this.letsTry(ball, -4, 1)
        }else if (playerTwoCollideResult === '5')
            ball.velocity = this.letsTry(ball, -4, -1.2)
        else if (playerTwoCollideResult === '6')
            ball.velocity = this.letsTry(ball, -3, -1.2)
        else if (playerTwoCollideResult === '7')
            ball.velocity = this.letsTry(ball, -2, -1.2)
        else if (playerTwoCollideResult === '8')
            ball.velocity = this.letsTry(ball, -1, -1.2)
        else if (playerTwoCollideResult === '9')
            ball.velocity = this.letsTry(ball, -1, -1.2)
       
        ball.position.x = ball.position.x + ball.velocity.x;
        ball.position.y = ball.position.y + ball.velocity.y;
      
        }
        state.step += 1;

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
                if (state.bonus.type === 'wall') 
                {
                    let wall = 
                    {
                        position: {
                            x: GRID_SIZE / 2,
                            y: (GRID_SIZE - 10) * Math.random(),
                        },
                        velocity: 0,
                        size: 9,
                    }
                    state.active.push({
                        type: state.bonus.type,
                        lifetime: 2000,
                        wall: wall
                    })

                    state.bonus = null;
                }
                else if (ball.position.x >= state.bonus.position.x - 1 && ball.position.x <= state.bonus.position.x + 1
                    && ball.position.y >= state.bonus.position.y - 1 && ball.position.y <= state.bonus.position.y + 1
                ) {
                    let position = null;
                    let lifetime = 2000;
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
                if (state.active.length > 0 && state.active[0]['type'] === 'wall')
                    return
                let bonus_x = Math.floor(Math.random() * (GRID_SIZE  - 5) + 5);
                let bonus_y = Math.floor(Math.random() * (GRID_SIZE - 10) + 5);
                if ((bonus_x < ball.position.x - 1  || bonus_x > ball.position.x + 1)
                    && (bonus_y < ball.position.y - 1 || bonus_y > ball.position.y + 1)
                ) 
                {
                    state.bonus = 
                    {
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
        } else if (ball.position.x > GRID_SIZE ) {
            return 1;
        }
        return false;
    }
    
    letsTry(ball: BallInterface, x : number, y : number) : PositionInterface
    {
        let n : PositionInterface = 
        {
            x : x, y : y
        }
        let div = 1;
        if (x === 2)
            div = 1.732
        let pr = (x * ball.velocity.x + ball.velocity.y * y) / div;
        if (pr === 0)
            pr = 0.001
        n.x = (2 * (x / pr) + ball.velocity.x);
        n.y = (2 * (y / pr) + ball.velocity.y);
        n.x -= ball.velocity.x;
        n.y -= ball.velocity.y;
        if (n.x === Infinity)
            n.x = -ball.velocity.x;
        if (n.y === Infinity)
            n.y = -ball.velocity.y;
        
        let norma = 1 / Math.sqrt((n.x * n.x) + (n.y * n.y))
        n.x = n.x * norma;
        n.y = n.y * norma;
        if ((x < 0 && n.x > 0) || (x > 0 && n.x < 0))
            n.x *= -1
        return (n)
    }

    isBallCollideWithRacket(ball: BallInterface, racket: PlayerRacketInterface): false | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'{
        let ballNextPosition = {
            x: ball.position.x + ball.velocity.x,
            y: ball.position.y + ball.velocity.y,
        }
        let collition = false;
        if (racket.position.x === 1)
        {  
            if (ballNextPosition.x < 1 && ball.position.x >= 1)
                collition = true;
        }
        else if (racket.position.x ===  GRID_SIZE - 2 )
        {
            if (ballNextPosition.x > GRID_SIZE - 2  && ball.position.x <= GRID_SIZE - 2)
                collition = true;
        }
        else if (racket.position.x === GRID_SIZE / 2)
        {
            if (ballNextPosition.x > racket.position.x && ball.position.x <=                    racket.position.x)
            collition = true;
            if (ballNextPosition.x < racket.position.x && ball.position.x >=                    racket.position.x)
            collition = true;
        }
        if (collition === true) 
        {
            let vertical = ballNextPosition.y - racket.position.y;
            if (vertical > -1)
            {
                if (vertical < 1)
                        return '1';
                else if (vertical < 2)
                        return '2';
                else if (vertical < 3)
                        return '3';
                else if (vertical < 4)
                        return '4';
                else if (vertical < 5)
                        return '5';
                else if (vertical < 6)
                        return '6';
                else if (vertical < 7)
                        return '7';
                else if (vertical < 8)
                        return '8';
                else if (vertical <= racket.size)
                        return '9';
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