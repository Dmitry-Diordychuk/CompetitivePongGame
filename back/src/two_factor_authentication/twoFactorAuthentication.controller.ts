import {Controller, Post, Res, UseGuards} from "@nestjs/common";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {UserEntity} from "@app/user/user.entity";
import {User} from "@app/user/decorators/user.decorator";
import {TwoFactorAuthenticationService} from "@app/two_factor_authentication/twoFactorAuthentication.service";
import {Response} from "express";

@Controller('api/2fa')
export class TwoFactorAuthenticationController {
    constructor(private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService) {
    }

    @UseGuards(AuthGuard)
    @Post('generate')
    async register(
        @Res() response: Response,
        @User() user: UserEntity
    ) {
        const { otpAuthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);
        return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpAuthUrl);
    }
}