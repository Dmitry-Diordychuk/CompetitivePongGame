import {Module} from "@nestjs/common";
import {AdminController} from "@app/admin/admin.controller";
import {AdminService} from "@app/admin/admin.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {ChannelEntity} from "@app/chat/channel.entity";
import {UserModule} from "@app/user/user.module";
import {ChatModule} from "@app/chat/chat.module";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ChannelEntity]), UserModule, ChatModule],
    controllers: [AdminController],
    providers: [AdminService],
    exports: []
})
export class AdminModule {}