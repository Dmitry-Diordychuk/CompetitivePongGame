import {Injectable} from "@nestjs/common";
import {UserEntity} from "@app/user/user.entity";
import {authenticator} from "otplib";
import {APP_NAME} from "@app/config";
import {UserService} from "@app/user/user.service";

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(
        private readonly userService: UserService
    ) {}

    public async generateTwoFactorAuthenticationSecret(user: UserEntity) {
        const secret = authenticator.generateSecret();

        const otpAuthUrl = authenticator.keyuri(
            encodeURIComponent(user.ft_id),
            encodeURIComponent(APP_NAME),
            secret)

        //await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

        return {
            secret,
            otpAuthUrl
        }
    }
}