import {UseGuards} from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException
} from "@nestjs/websockets";
import {GameService} from "@app/game/game.service";
import {MatchmakingService} from "@app/matchmaking/matchmaking.service";
import {Server, Socket} from "socket.io";
import {WSUser} from "@app/chat/decorator/webSocketUser.decorator";
import {UserEntity} from "@app/user/user.entity";
import {ClientPairInterface} from "@app/matchmaking/types/clientPair.interface";
import {ClientInfoService} from "@app/matchmaking/clientInfo.service";
import {ProfileService} from "@app/profile/profile.service";
import WebSocketRoleGuard from "@app/shared/guards/webSocketRole.guard";
import Role from "@app/user/types/role.enum";


@UseGuards(WebSocketRoleGuard(Role.User))
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


    initClient(user, socket, roomName, playerNumber) {
        this.clientInfoService.setClientInfo(user.id, socket.id, roomName, playerNumber);
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
        this.initClient(pair.clientA.user, pair.clientA.socket, roomName, 1);

        pair.clientB.socket.emit(`matchmaking-init`, roomName);
        this.initClient(pair.clientB.user, pair.clientB.socket, roomName, 2);

        this.gameService.startGameInterval(this.server, roomName, async (winner) => {
            if (winner === 1) {
                await this.profileService.addMatch('ladder', pair.clientA.user, pair.clientB.user);
            } else {
                await this.profileService.addMatch('ladder', pair.clientB.user, pair.clientA.user);
            }
            this.clientInfoService.removeClientInfo(roomName);
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

    @SubscribeMessage('duel-invite')
    async handleDuelInvite (
        @WSUser() user,
        @ConnectedSocket() client,
        @MessageBody() {rivalId, gameMode},
    ) {
        let rival = null;
        let rivalSocket = null;
        for (let socket of this.server.sockets.sockets) {
            if (socket[1].handshake.headers.user["id"] === rivalId) {
                rival = socket[1].handshake.headers.user;
                rivalSocket = socket[1];
            }
        }

        if (rival) {
            this.matchmakingService.inviteToDuel(user, client, rival, rivalSocket, gameMode);
            this.server.to(rivalSocket.id).emit('duel-invited', {
                rivalId: user.id,
                gameMode: gameMode,
            });
        } else {
            throw new WsException('Player offline!');
        }
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
        this.initClient(pair.clientA.user, pair.clientA.socket, roomName, 1);

        pair.clientB.socket.emit(`duel-init`, roomName);
        this.initClient(pair.clientB.user, pair.clientB.socket, roomName, 2);

        this.gameService.startGameInterval(this.server, roomName, async (winner) => {
            if (winner === 1) {
                await this.profileService.addMatch('duel', pair.clientA.user, pair.clientB.user);
            } else {
                await this.profileService.addMatch('duel', pair.clientB.user, pair.clientA.user);
            }
            this.clientInfoService.removeClientInfo(roomName);
        }, pair.gameMode);
    }

    @SubscribeMessage('duel-decline')
    handleDuelDecline (
        @WSUser() user,
        @ConnectedSocket() client,
        @MessageBody() rivalId,
    ) {
        this.matchmakingService.declineDuel(user, rivalId);
    }

    @SubscribeMessage('is-in-game')
    handleIsInGame(
        @ConnectedSocket() client,
        @MessageBody() userId,
    ) {
        const room = this.clientInfoService.getUserRoom(userId);
        if (room) {
            client.emit('in-game', true);
        } else {
            client.emit('in-game', false);
        }
    }

    @SubscribeMessage('spectate-game')
    async handleSpectateGame(
        @WSUser() user,
        @ConnectedSocket() client: Socket,
        @MessageBody() userId,
    ) {
        const room = this.clientInfoService.getUserRoom(userId);
        if (room) {
            this.initClient(user, client, room, 0);
        } else {
            throw new WsException("Player isn't in game!");
        }
    }
}
