import {Injectable, NestMiddleware} from "@nestjs/common";
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

        const decode = this.userService.decodeJwt(token);

        if (!decode) {
            req.user = null;
            next();
            return;
        }

        req.user = await this.userService.getUserById(decode.id);

        if (!req.user || req.user.ftId != decode.ftId || req.user.username != decode.username) {
            req.user = null;
            next();
            return;
        }

        req.isSecondFactorAuthenticated = decode.isSecondFactorAuthenticated;
        next();
    }
}