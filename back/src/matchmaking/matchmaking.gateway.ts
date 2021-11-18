import {UseGuards} from "@nestjs/common";
import {WebSocketAuthGuard} from "@app/chat/guard/webSocketAuth.guard";
import {
    ConnectedSocket, MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit, SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {GameService} from "@app/game/game.service";
import {MatchmakingService} from "@app/matchmaking/matchmaking.service";
import {Server, Socket} from "socket.io";
import {WSUser} from "@app/chat/decorator/webSocketUser.decorator";
import {UserEntity} from "@app/user/user.entity";
import {ClientPairInterface} from "@app/matchmaking/types/clientPair.interface";
import {GameStateInterface} from "@app/game/types/gameState.interface";
import {ClientInfoService} from "@app/matchmaking/clientInfo.service";

@UseGuards(WebSocketAuthGuard)
@WebSocketGateway(3003, { cors: true })
export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly gameService: GameService,
        private readonly matchmakingService: MatchmakingService,
        private readonly clientInfoService: ClientInfoService,
    ) {}

    @WebSocketServer()
    server: Server;

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

        //UserA
        let roomName = pair.clientA.user.id.toString() + pair.clientB.user.id.toString() + this.gameService.makeId(5);
        this.clientInfoService.setClientRoom(pair.clientA.socket.id, roomName);

        pair.clientA.socket.emit('create', roomName);

        this.gameService.initGame(roomName);

        pair.clientA.socket.join(roomName);
        this.clientInfoService.setClientPlayerNumber(pair.clientA.socket.id, 1);
        pair.clientA.socket.emit('init', 1);

        //UserB
        this.clientInfoService.setClientRoom(pair.clientB.socket.id, roomName);

        pair.clientB.socket.emit('join', roomName)

        pair.clientB.socket.join(roomName);
        this.clientInfoService.setClientPlayerNumber(pair.clientB.socket.id, 2);
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

    // TODO: Убарать после тестирования все что ниже
    @SubscribeMessage('newGame')
    handleNewGame(
        @WSUser() user,
        @ConnectedSocket() client
    ) {
        let roomName = this.gameService.makeId(5);
        this.clientInfoService.setClientRoom(client.id, roomName);
        client.emit('gameCode', roomName);

        this.gameService.initGame(roomName);

        client.join(roomName);
        this.clientInfoService.setClientPlayerNumber(client.id, 1);
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

        this.clientInfoService.setClientRoom(client.id, roomName);

        client.join(roomName);
        this.clientInfoService.setClientPlayerNumber(client.id, 2);
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
}
