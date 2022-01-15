import {Body, Controller, HttpCode, HttpException, HttpStatus, Post, Res, UseGuards} from "@nestjs/common";
import {UserEntity} from "@app/user/user.entity";
import {User} from "@app/user/decorators/user.decorator";
import {TwoFactorAuthenticationService} from "@app/two_factor_authentication/twoFactorAuthentication.service";
import {Response} from "express";
import {UserService} from "@app/user/user.service";
import {TwoFactorAuthenticationsCodeDto} from "@app/two_factor_authentication/dto/twoFactorAuthenticationsCode.dto";
import RoleGuard from "@app/shared/guards/role.guard";
import Role from "@app/user/types/role.enum";

@Controller('api/2fa')
@UseGuards(RoleGuard(Role.User))
export class TwoFactorAuthenticationController {
    constructor(
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
        private readonly userService: UserService
    ) {}

    @Post('generate')
    async register(
        @Res() response: Response,
        @User() user: UserEntity
    ) {
        if (user.isTwoFactorAuthenticationEnable)
            throw new HttpException("Already generated!", HttpStatus.BAD_REQUEST);
        const { otpAuthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);
        return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpAuthUrl);
    }

    @HttpCode(200)
    @Post('turn-on')
    async turnOnTwoFactorAuthentication(
        @User() user: UserEntity,
        @Body() twoFactorAuthenticationsCodeDto: TwoFactorAuthenticationsCodeDto
    ) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
            twoFactorAuthenticationsCodeDto.code,
            user.twoFactorAuthenticationsSecret
        );

        if (!isCodeValid) {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        await this.userService.turnOnTwoFactorAuthentication(user.id);
    }

    @HttpCode(200)
    @Post('turn-off')
    async turnOffTwoFactorAuthentication(
        @User() user: UserEntity,
        @Body() twoFactorAuthenticationsCodeDto: TwoFactorAuthenticationsCodeDto
    ) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
            twoFactorAuthenticationsCodeDto.code,
            user.twoFactorAuthenticationsSecret
        );

        if (!isCodeValid) {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        await this.userService.turnOffTwoFactorAuthentication(user.id);
    }

    @HttpCode(200)
    @Post('authenticate')
    async authenticate(
        @User() user: UserEntity,
        @Body() twoFactorAuthenticationCodeDto: TwoFactorAuthenticationsCodeDto
    ) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
            twoFactorAuthenticationCodeDto.code,
            user.twoFactorAuthenticationsSecret
        );

        if (!isCodeValid) {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        return this.userService.buildUserResponse(user, true);
    }
}