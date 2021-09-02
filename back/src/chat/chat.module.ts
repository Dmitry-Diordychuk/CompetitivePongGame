import {Module} from "@nestjs/common";
import {ChatService} from "@app/chat/chat.service";
import {ChatController} from "@app/chat/chat.controller";
import {ChatGateway} from "@app/chat/chat.gateway";
import {UsersService} from "@app/users/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersEntity} from "@app/users/users.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UsersEntity])],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, UsersService],
})
export class ChatModule {}
