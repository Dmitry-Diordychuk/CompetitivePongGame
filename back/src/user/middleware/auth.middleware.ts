import {Injectable, NestMiddleware} from "@nestjs/common";
import {verify} from "jsonwebtoken";
import {JWT_SECRET} from "@app/config";
import {UserService} from "@app/user/user.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
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
            const decode = verify(token, JWT_SECRET);
            req.user = await this.userService.getUserById(decode.id);
            next();
        } catch (exception) {
            req.user = null;
            next();
        }

    }
}