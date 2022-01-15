import {forwardRef, Module} from "@nestjs/common";
import {ChatService} from "@app/chat/chat.service";
import {ChannelController} from "@app/chat/channel.controller";
import {ChatGateway} from "@app/chat/chat.gateway";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {ChannelEntity} from "@app/chat/channel.entity";
import {UserModule} from "@app/user/user.module";
import {SanctionEntity} from "@app/sanction/sanction.entity";
import {ClientInfoModule} from "@app/clientInfo/clientInfo.module";

@Module({
    imports: [TypeOrmModule.forFeature([ChannelEntity, UserEntity, SanctionEntity]), UserModule, ClientInfoModule],
    controllers: [ChannelController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService],
})
export class ChatModule {}
