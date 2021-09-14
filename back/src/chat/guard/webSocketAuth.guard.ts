import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient();

        return client.handshake.headers.user;
    }
}