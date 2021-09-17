import {MiddlewareConsumer, Module, RequestMethod} from "@nestjs/common";
import {UserController} from "@app/user/user.controller";
import {UserService} from "@app/user/user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {ChannelEntity} from "@app/chat/channel.entity";
import {SecondFactorAuthMiddleware} from "@app/user/middleware/secondFactorAuth.middleware";
import {HttpModule} from "@nestjs/axios";
import {AuthMiddleware} from "@app/user/middleware/auth.middleware";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ChannelEntity]), HttpModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes({
                path: '*',
                method: RequestMethod.ALL
            })
        consumer
            .apply(SecondFactorAuthMiddleware)
            .exclude('api/2fa/authenticate')
            .forRoutes({
                path: '*',
                method: RequestMethod.ALL
            })
    }
}
