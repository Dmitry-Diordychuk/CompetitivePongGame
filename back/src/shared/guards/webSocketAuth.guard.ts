import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient();

        return client.handshake.headers.user;
    }
}