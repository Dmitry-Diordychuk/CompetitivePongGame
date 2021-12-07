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
import {ClientInfoService} from "@app/matchmaking/clientInfo.service";
import {ProfileService} from "@app/profile/profile.service";


@UseGuards(WebSocketAuthGuard)
@WebSocketGateway(3002, { cors: true })
export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly gameService: GameService,
        private readonly matchmakingService: MatchmakingService,
        private readonly clientInfoService: ClientInfoService,
        private readonly profileService: ProfileService,
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

        pair.clientA.socket.emit(`matchmaking-init`, roomName);
        this.initClient(pair.clientA.socket, roomName, 1);

        pair.clientB.socket.emit(`matchmaking-init`, roomName);
        this.initClient(pair.clientB.socket, roomName, 2);

        this.gameService.startGameInterval(this.server, roomName, async (winner) => {
            if (winner === 1) {
                await this.profileService.addMatch('ladder', pair.clientA.user, pair.clientB.user);
            } else {
                await this.profileService.addMatch('ladder', pair.clientB.user, pair.clientA.user);
            }
        });
    }
    
    @SubscribeMessage('matchmaking-decline-game')
    handleDeclineGame(
        @WSUser() user: UserEntity,
        @ConnectedSocket() client: Socket
    ) {
        const anotherClient = this.matchmakingService.removeFromWaitList(user);
        client.emit('matchmaking-declined');
        anotherClient.emit('matchmaking-restart')
    }

    @SubscribeMessage('spectate-game')
    async handleSpectateGame(
        @WSUser() user: UserEntity,
        @ConnectedSocket() client: Socket,
        @MessageBody() roomName: string
    ) {
        this.initClient(client, roomName, 0);
    }

    @SubscribeMessage('duel-invite')
    async handleDuelInvite (
        @WSUser() user,
        @ConnectedSocket() client,
        @MessageBody() {rivalId, gameMode},
    ) {
        let rival = null;
        let rival_socket = null;
        for (let socket of this.server.sockets.sockets) {
            if (socket[1].handshake.headers.user["id"] === rivalId) {
                rival = socket[1].handshake.headers.user;
                rival_socket = socket;
            }
        }
        let roomName = this.gameService.makeId(5);
        if (rival)
            this.matchmakingService.inviteToDuel(user, client, rival, rival_socket);
        client.emit(rivalId, {duel:{room: roomName, rivalId: user.id}});
    }

    @SubscribeMessage('duel-accept')
    handleDuelAccept (
        @WSUser() user,
        @ConnectedSocket() client,
        @MessageBody() rivalId,
    ) {
        const pair: ClientPairInterface | null = this.matchmakingService.acceptDuel(user, rivalId);
        if (!pair) {
            return;
        }

        let roomName = pair.clientA.user.id.toString() + pair.clientB.user.id.toString() + this.gameService.makeId(5);
        this.gameService.initGame(roomName);

        pair.clientA.socket.emit(`duel-init`, roomName);
        this.initClient(pair.clientA.socket, roomName, 1);

        pair.clientB.socket.emit(`duel-init`, roomName);
        this.initClient(pair.clientB.socket, roomName, 2);

        this.gameService.startGameInterval(this.server, roomName, async (winner) => {
            if (winner === 1) {
                await this.profileService.addMatch('duel', pair.clientA.user, pair.clientB.user);
            } else {
                await this.profileService.addMatch('duel', pair.clientB.user, pair.clientA.user);
            }
        });
    }
}
