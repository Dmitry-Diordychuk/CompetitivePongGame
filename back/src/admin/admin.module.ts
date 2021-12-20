import {Module} from "@nestjs/common";
import {AdminController} from "@app/admin/admin.controller";
import {AdminService} from "@app/admin/admin.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {ChannelEntity} from "@app/chat/channel.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ChannelEntity])],
    controllers: [AdminController],
    providers: [AdminService],
    exports: []
})
export class AdminModule {}