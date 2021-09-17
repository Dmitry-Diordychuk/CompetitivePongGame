import {Module} from "@nestjs/common";
import {TwoFactorAuthenticationController} from "@app/two_factor_authentication/twoFactorAuthentication.controller";
import {TwoFactorAuthenticationService} from "@app/two_factor_authentication/twoFactorAuthentication.service";
import {UserModule} from "@app/user/user.module";

@Module({
    imports: [UserModule],
    controllers: [TwoFactorAuthenticationController],
    providers: [TwoFactorAuthenticationService],
    exports: [TwoFactorAuthenticationService]
})
export class TwoFactorAuthenticationModule {}
