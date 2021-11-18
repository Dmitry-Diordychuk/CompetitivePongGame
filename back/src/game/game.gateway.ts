import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit, SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {GameService} from "@app/game/game.service";
import {GameStateInterface} from "@app/game/types/gameState.interface";
import {WSUser} from "@app/chat/decorator/webSocketUser.decorator";
import {MatchmakingService} from "@app/game/matchmaking.service";
import {UseGuards} from "@nestjs/common";
import {WebSocketAuthGuard} from "@app/chat/guard/webSocketAuth.guard";
import {UserEntity} from "@app/user/user.entity";
import {GameClientInterface} from "@app/game/types/gameClient.interface";
import {ClientPairInterface} from "@app/game/types/clientPair.interface";

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
    playerNumbers = {};

    afterInit() {
    }

    handleConnection(
        @ConnectedSocket() socket: Socket
    ) {
        const user = socket.handshake.headers.user;
        this.matchmakingService.updateSocketIfUserInQueue(user, socket);
    }

    handleDisconnect() {
    }

    @SubscribeMessage('addUserInQueue')
    handleMatchmaking(
        @WSUser() user: UserEntity,
        @ConnectedSocket() socket: Socket
    ) {
        this.matchmakingService.addInQueue(user, socket);
    }

    @SubscribeMessage('leaveQueue')
    handleLeaveMatchmaking(
        @WSUser() user: UserEntity
    ) {
        this.matchmakingService.leaveQueue(user);
    }

    @SubscribeMessage('accept-game')
    handleAcceptGame(
        @WSUser() user: UserEntity,
    ) {
        const pair: ClientPairInterface | null = this.matchmakingService.acceptGame(user);
        if (!pair) {
            return;
        }

        delete this.clientRooms[pair.clientA.socket.id];
        delete this.clientRooms[pair.clientB.socket.id];

        //UserA
        let roomName = pair.clientA.user.id.toString() + pair.clientB.user.id.toString() + this.gameService.makeId(5);
        this.clientRooms[pair.clientA.socket.id] = roomName;

        pair.clientA.socket.emit('create', roomName);

        this.gameService.initGame(roomName);

        pair.clientA.socket.join(roomName);
        this.playerNumbers[pair.clientA.socket.id] = 1;
        pair.clientA.socket.emit('init', 1);

        //UserB
        this.clientRooms[pair.clientB.socket.id] = roomName;

        pair.clientB.socket.emit('join', roomName)

        pair.clientB.socket.join(roomName);
        this.playerNumbers[pair.clientB.socket.id] = 2;
        pair.clientB.socket.emit('init', 2);

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

    // TODO: доделать
    @SubscribeMessage('decline-game')
    handleDeclineGame(
        @WSUser() user: UserEntity,
        @ConnectedSocket() client: Socket
    ) {
        const anotherClient = this.matchmakingService.removeFromWaitList(user);
        anotherClient.emit('matchmaking-restart')
        client.emit('matchmaking-declined');
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
        this.playerNumbers[client.id] = 1;
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
        this.playerNumbers[client.id] = 2;
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
        console.log(roomName, this.clientRooms)

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

        this.gameService.setPlayerVelocity(roomName, this.playerNumbers[client.id], vel);
    }
}
