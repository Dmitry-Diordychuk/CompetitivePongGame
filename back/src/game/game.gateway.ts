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
import {UseGuards} from "@nestjs/common";
import {WebSocketAuthGuard} from "@app/chat/guard/webSocketAuth.guard";
import {ClientInfoService} from "@app/matchmaking/clientInfo.service";

@UseGuards(WebSocketAuthGuard)
@WebSocketGateway(3003, { cors: true })
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

    @SubscribeMessage('keyDown')
    handleKeyDown(
        @ConnectedSocket() client,
        @MessageBody() keyCode
    ) {
        const roomName = this.clientInfoService.getClientRoom(client.id);
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
        const playerNumber = this.clientInfoService.getClientPlayerNumber(client.id);
        this.gameService.setPlayerVelocity(roomName, playerNumber, vel);
    }
}
