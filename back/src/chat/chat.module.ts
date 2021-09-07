import {Module} from "@nestjs/common";
import {ChatService} from "@app/chat/chat.service";
import {ChannelController} from "@app/chat/channel.controller";
import {ChatGateway} from "@app/chat/chat.gateway";
import {UserService} from "@app/user/user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {ChannelEntity} from "@app/chat/channel.entity";
import {HttpModule} from "@nestjs/axios";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ChannelEntity]), HttpModule],
    controllers: [ChannelController],
    providers: [ChatService, ChatGateway, UserService],
})
export class ChatModule {}
