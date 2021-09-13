import {MiddlewareConsumer, Module, RequestMethod} from "@nestjs/common";
import {TwoFactorAuthenticationController} from "@app/two_factor_authentication/twoFactorAuthentication.controller";
import {TwoFactorAuthenticationService} from "@app/two_factor_authentication/twoFactorAuthentication.service";
import {UserModule} from "@app/user/user.module";
import {BasicAuthMiddleware} from "@app/two_factor_authentication/middleware/BasicAuth.middleware";

@Module({
    imports: [UserModule],
    controllers: [TwoFactorAuthenticationController],
    providers: [TwoFactorAuthenticationService],
    exports: [TwoFactorAuthenticationService]
})
export class TwoFactorAuthenticationModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(BasicAuthMiddleware)
            .forRoutes({
                path: 'api/2fa/authenticate',
                method: RequestMethod.ALL
            })
    }
}
