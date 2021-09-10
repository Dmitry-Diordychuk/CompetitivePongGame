import {Controller, Post} from "@nestjs/common";

@Controller('api/2fa')
export class TwoFactorAuthenticationController {
    @Post('generate')
    register() {
        return 'Hello 2fa!';
    }
}