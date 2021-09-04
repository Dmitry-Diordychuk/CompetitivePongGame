import {Module} from "@nestjs/common";
import {ChatService} from "@app/chat/chat.service";
import {ChatController} from "@app/chat/chat.controller";
import {ChatGateway} from "@app/chat/chat.gateway";
import {UserService} from "@app/user/user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {ChannelEntity} from "@app/chat/channel.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ChannelEntity])],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, UserService],
})
export class ChatModule {}
