import {Injectable, NestMiddleware} from "@nestjs/common";
import {verify} from "jsonwebtoken";
import {JWT_SECRET} from "@app/config";
import {UserService} from "@app/user/user.service";

@Injectable()
export class BasicAuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) {
    }

    async use(req: any, res: any, next: () => void) {
        if (!req.headers.authorization) {
            req.user = null;
            next();
            return;
        }

        const token = req.headers.authorization.split(' ')[1];

        try {
            const decode: TokenPayloadInterface = verify(token, JWT_SECRET);
            req.user = await this.userService.getUserById(decode["id"]);

            if (!req.user || decode["ft_id"] != req.user.ft_id || decode["username"] != req.user.username) {
                req.user = null;
            }

            next();
        } catch (exception) {
            req.user = null;
            next();
        }

    }
}