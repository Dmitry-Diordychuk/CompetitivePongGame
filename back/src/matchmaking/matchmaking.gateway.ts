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

    @SubscribeMessage('matchmaking-add-in-queue')
    handleMatchmaking(
        @WSUser() user: UserEntity,
        @ConnectedSocket() socket: Socket
    ) {
        this.matchmakingService.addInQueue(user, socket);
    }

    @SubscribeMessage('matchmaking-leave-queue')
    handleLeaveMatchmaking(
        @WSUser() user: UserEntity
    ) {
        this.matchmakingService.leaveQueue(user);
    }


    initClient(socket, roomName, playerNumber) {
        this.clientInfoService.setClientRoom(socket.id, roomName);
        this.clientInfoService.setClientPlayerNumber(socket.id, playerNumber);
        socket.join(roomName);
        socket.emit('game-init', playerNumber);
    }


    @SubscribeMessage('matchmaking-accept-game')
    handleAcceptGame(
        @WSUser() user: UserEntity,
    ) {
        const pair: ClientPairInterface | null = this.matchmakingService.acceptGame(user);
        if (!pair) {
            return;
        }

        let roomName = pair.clientA.user.id.toString() + pair.clientB.user.id.toString() + this.gameService.makeId(5);
        this.gameService.initGame(roomName);

        pair.clientA.socket.emit(`matchmaking-create`, roomName);
        this.initClient(pair.clientA.socket, roomName, 1);

        pair.clientB.socket.emit(`matchmaking-join`, roomName);
        this.initClient(pair.clientB.socket, roomName, 2);

        this.gameService.startGameInterval(roomName,
            (gameState: GameStateInterface) => {
                this.server.sockets
                    .in(roomName)
                    .emit('game-state', JSON.stringify(gameState))
            },
            (winner: 1 | 2) => {
                this.server.sockets
                    .in(roomName)
                    .emit('game-over', JSON.stringify({winner}))
            }
        );
    }

    // TODO: доделать
    @SubscribeMessage('matchmaking-decline-game')
    handleDeclineGame(
        @WSUser() user: UserEntity,
        @ConnectedSocket() client: Socket
    ) {
        const anotherClient = this.matchmakingService.removeFromWaitList(user);
        client.emit('matchmaking-declined');
        anotherClient.emit('matchmaking-restart')
    }

    // TODO: Убарать после тестирования все что ниже
    @SubscribeMessage('new-game')
    handleNewGame(
        @WSUser() user,
        @ConnectedSocket() client
    ) {
        let roomName = this.gameService.makeId(5);
        client.emit('game-code', roomName);
        this.gameService.initGame(roomName);

        this.initClient(client, roomName, 1);
    }

    @SubscribeMessage('join-game')
    async handleJoinGame(
        @WSUser() user: UserEntity,
        @ConnectedSocket() client: Socket,
        @MessageBody() roomName: string
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
            client.emit('exception', 'Unknown game code');
            return;
        } else if (numClients > 1) {
            client.emit('exception', 'This game is already in progress');
            return;
        }

        this.initClient(client, roomName, 2);

        this.gameService.startGameInterval(roomName,
            (gameState: GameStateInterface) => {
                this.server.sockets
                    .in(roomName)
                    .emit('game-state', JSON.stringify(gameState))
            },
            (winner: 1 | 2) => {
                this.server.sockets
                    .in(roomName)
                    .emit('game-over', JSON.stringify({winner}))
            }
        );
    }
}
