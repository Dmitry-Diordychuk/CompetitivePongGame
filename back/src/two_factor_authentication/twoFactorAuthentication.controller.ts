import {Body, Controller, HttpCode, HttpException, HttpStatus, Post, Res, UseGuards} from "@nestjs/common";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {UserEntity} from "@app/user/user.entity";
import {User} from "@app/user/decorators/user.decorator";
import {TwoFactorAuthenticationService} from "@app/two_factor_authentication/twoFactorAuthentication.service";
import {Response} from "express";
import {UserService} from "@app/user/user.service";
import {TwoFactorAuthenticationsCodeDto} from "@app/two_factor_authentication/dto/twoFactorAuthenticationsCode.dto";

@Controller('api/2fa')
export class TwoFactorAuthenticationController {
    constructor(
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
        private readonly userService: UserService
    ) {}

    @UseGuards(AuthGuard)
    @Post('generate')
    async register(
        @Res() response: Response,
        @User() user: UserEntity
    ) {
        const { otpAuthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);
        return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpAuthUrl);
    }

    @HttpCode(200)
    @UseGuards(AuthGuard)
    @Post('turn-on')
    async turnOnTwoFactorAuthentication(
        @User() user: UserEntity,
        @Body() twoFactorAuthenticationsCode: TwoFactorAuthenticationsCodeDto
    ) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
            twoFactorAuthenticationsCode.code, user
        );

        if (!isCodeValid) {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        await this.userService.turnOnTwoFactorAuthentication(user.id);
    }
}