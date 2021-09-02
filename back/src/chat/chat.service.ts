import { Injectable } from '@nestjs/common';
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {UsersService} from "@app/users/users.service";
import {UsersEntity} from "@app/users/users.entity";
import {ChatUserResponseInterface} from "@app/chat/types/chatUser.interface";

@Injectable()
export class ChatService {
    constructor(private readonly userService: UsersService) {}

    getToken(socket: Socket): string {
        const auth_field = socket.handshake.headers.authorization;

        if (!auth_field) {
            throw new WsException('There is no token in authorization field');
        }

        const token = auth_field.split(' ')[1];
        return token
    }

    async getUserFromToken(token: string): Promise<UsersEntity> {
        const user = await this.userService.getUserFromToken(token);

        if (!user) {
            throw new WsException('Invalid credentials');
        }

        return user;
    }
}
