import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Server} from "socket.io";

@WebSocketGateway(3003)
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    async afterInit() {
    }

    async handleConnection() {
    }

    handleDisconnect() {
    }
}
