import {Injectable, NestMiddleware} from "@nestjs/common";

@Injectable()
export class SecondFactorAuthMiddleware implements NestMiddleware {
    async use(req: any, res: any, next: () => void) {
        if (req.user === null) {
            next();
            return;
        }

        if (req.user.isTwoFactorAuthenticationEnable && !req.isSecondFactorAuthenticated) {
            req.user = null;
            next();
            return;
        }
        next();
    }
}