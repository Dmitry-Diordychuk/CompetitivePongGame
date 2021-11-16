import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit, SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server} from "socket.io";
import {GameService} from "@app/game/game.service";
import {GameStateInterface} from "@app/game/types/gameState.interface";
import {WSUser} from "@app/chat/decorator/webSocketUser.decorator";
import {MatchmakingService} from "@app/game/matchmaking.service";
import {UseGuards} from "@nestjs/common";
import {WebSocketAuthGuard} from "@app/chat/guard/webSocketAuth.guard";

@UseGuards(WebSocketAuthGuard)
@WebSocketGateway(3003, { cors: true })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly gameService: GameService,
        private readonly matchmakingService: MatchmakingService,
    ) {}

    @WebSocketServer()
    server: Server;

    clientRooms = {};

    afterInit() {
    }

    handleConnection(
        @ConnectedSocket() socket
    ) {
        const user = socket.handshake.headers.user;
        this.matchmakingService.updateSocketIfUserInQueue(user, socket);
    }

    handleDisconnect() {
    }

    @SubscribeMessage('addUserInQueue')
    handleMatchmaking(
        @WSUser() user,
        @ConnectedSocket() socket
    ) {
        this.matchmakingService.addInQueue(user, socket);
    }

    @SubscribeMessage('leaveQueue')
    handleLeaveMatchmaking(
        @WSUser() user
    ) {
        this.matchmakingService.leaveQueue(user);
    }

    @SubscribeMessage('accept-game')
    handleAcceptGame(
        @WSUser() user,
        @ConnectedSocket() client,
    ) {
        const players = this.matchmakingService.acceptGame(user);
        if (!players) {
            return;
        }

        delete this.clientRooms[players.userA.socket.id]
        delete this.clientRooms[players.userB.socket.id]
        //UserA
        let roomName = players.userA.id.toString() + players.userB.id.toString() + this.gameService.makeId(5);
        this.clientRooms[players.userA.socket.id] = roomName;

        players.userA.socket.emit('create', roomName);

        this.gameService.initGame(roomName);

        players.userA.socket.join(roomName);
        players.userA.socket.number = 1;
        players.userA.socket.emit('init', 1);

        //UserB
        this.clientRooms[players.userB.socket.id] = roomName;

        players.userB.socket.emit('join', roomName)

        players.userB.socket.join(roomName);
        players.userB.socket.number = 2;
        players.userB.socket.emit('init', 2);

        this.gameService.startGameInterval(roomName,
            (gameState: GameStateInterface) => {
                this.server.sockets
                    .in(roomName)
                    .emit('gameState', JSON.stringify(gameState))
            },
            (winner: 1 | 2) => {
                this.server.sockets
                    .in(roomName)
                    .emit('gameOver', JSON.stringify({winner}))
            }
        );
    }

    @SubscribeMessage('decline-game')
    handleDeclineGame(
        @WSUser() user
    ) {
        this.matchmakingService.declineGame(user);
    }


    @SubscribeMessage('newGame')
    handleNewGame(
        @WSUser() user,
        @ConnectedSocket() client
    ) {
        let roomName = this.gameService.makeId(5);
        this.clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        this.gameService.initGame(roomName);

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    @SubscribeMessage('joinGame')
    async handleJoinGame(
        @WSUser() user,
        @ConnectedSocket() client,
        @MessageBody() roomName
    ) {
        let allUsers;
        if (this.server.sockets.adapter.rooms.has(roomName)) {
            allUsers = await this.server.in(roomName).fetchSockets();
        }

        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }

        this.clientRooms[client.id] = roomName;

        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);

        this.gameService.startGameInterval(roomName,
            (gameState: GameStateInterface) => {
                this.server.sockets
                    .in(roomName)
                    .emit('gameState', JSON.stringify(gameState))
            },
            (winner: 1 | 2) => {
                this.server.sockets
                    .in(roomName)
                    .emit('gameOver', JSON.stringify({winner}))
            }
        );
    }


    @SubscribeMessage('keyDown')
    handleKeyDown(
        @ConnectedSocket() client,
        @MessageBody() keyCode
    ) {
        const roomName = this.clientRooms[client.id];
        console.log(roomName)

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch (exception) {
            console.error(exception);
            return;
        }

        const vel = this.gameService.getUpdatedVelocity(keyCode);

        this.gameService.setPlayerVelocity(roomName, client.number, vel);
    }
}
