import {Injectable} from "@nestjs/common";
import {UserEntity} from "@app/user/user.entity";
import {authenticator} from "otplib";
import {APP_NAME} from "@app/config";
import {UserService} from "@app/user/user.service";
import {toFileStream} from 'qrcode';
import {Response} from "express";

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(
        private readonly userService: UserService
    ) {}

    async generateTwoFactorAuthenticationSecret(user: UserEntity) {
        const secret = authenticator.generateSecret();

        const otpAuthUrl = authenticator.keyuri(
            encodeURIComponent(user.ftId),
            encodeURIComponent(APP_NAME),
            secret)

        await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

        return {
            secret,
            otpAuthUrl
        }
    }

    async pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
        return toFileStream(stream, otpAuthUrl);
    }

    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, secret: string) {
        return authenticator.verify({
            token: twoFactorAuthenticationCode,
            secret: secret
        })
    }
}