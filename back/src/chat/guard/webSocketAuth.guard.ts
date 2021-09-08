import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {WsException} from "@nestjs/websockets";
import {verify} from "jsonwebtoken";
import {JWT_SECRET} from "@app/config";
import {UserService} from "@app/user/user.service";

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
    constructor(private readonly userService: UserService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const client = context.switchToWs().getClient();

        if (!client.handshake.headers.authorization) {
            throw new WsException('Unauthorized connection!');
        }

        const token = client.handshake.headers.authorization.split(' ')[1];

        try {
            const decode = verify(token, JWT_SECRET);
            const user = await this.userService.getUserById(decode.id);
            if (user)
                return true;
        } catch (exception) {
            return false;
        }

        throw new WsException('Unauthorized connection!');
    }
}