import {Module} from "@nestjs/common";
import {ChatService} from "@app/chat/chat.service";
import {ChatController} from "@app/chat/chat.controller";
import {ChatGateway} from "@app/chat/chat.gateway";
import {UsersService} from "@app/users/users.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersEntity} from "@app/users/users.entity";
import {RoomEntity} from "@app/chat/room.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UsersEntity, RoomEntity])],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, UsersService],
})
export class ChatModule {}
