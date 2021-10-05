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

    handleConnection() {
    }

    handleDisconnect() {
    }

    @SubscribeMessage('addUserInQueue')
    handleMatchmaking(
        @WSUser() user,
        @ConnectedSocket() socket
    ) {
        this.matchmakingService.AddInQueue(user, socket);
    }

    @SubscribeMessage('newGame')
    handleNewGame(
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
