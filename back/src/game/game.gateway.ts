import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit, SubscribeMessage,
    WebSocketGateway,
    WebSocketServer, WsException
} from "@nestjs/websockets";
import {Server} from "socket.io";
import {GameService} from "@app/game/game.service";
import {UseGuards} from "@nestjs/common";
import {WebSocketAuthGuard} from "@app/shared/guards/webSocketAuth.guard";
import {ClientInfoService} from "@app/matchmaking/clientInfo.service";

@UseGuards(WebSocketAuthGuard)
@WebSocketGateway(3002, { cors: true })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly gameService: GameService,
        private readonly clientInfoService: ClientInfoService,
    ) {}

    @WebSocketServer()
    server: Server;

    afterInit() {
    }

    handleConnection() {
    }

    handleDisconnect() {
    }

    @SubscribeMessage('leaveSpectate')
    handleLeaveSpectate(
        @ConnectedSocket() client
    ) {
        const clientInfo = this.clientInfoService.getClientInfo(client.id);
        if (!clientInfo) {
            return;
        }
        this.clientInfoService.removeClientInfo(clientInfo.roomName);
    }

    @SubscribeMessage('giveUp')
    handleGiveUp(
        @ConnectedSocket() client
    ) {
        const clientInfo = this.clientInfoService.getClientInfo(client.id);
        if (!clientInfo) {
            return;
        }
        this.gameService.giveUp(clientInfo.roomName, clientInfo.playerNumber);
    }

    @SubscribeMessage('keyDown')
    handleKeyDown(
        @ConnectedSocket() client,
        @MessageBody() keyCode
    ) {
        const clientInfo = this.clientInfoService.getClientInfo(client.id);
        if (!clientInfo) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch (exception) {
            throw new WsException('Wrong input!');
        }

        const vel = this.gameService.getUpdatedVelocity(keyCode);
        this.gameService.setPlayerVelocity(clientInfo.roomName, clientInfo.playerNumber, vel);
    }
}
