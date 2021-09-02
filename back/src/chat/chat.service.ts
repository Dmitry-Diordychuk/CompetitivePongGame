import { Injectable } from '@nestjs/common';
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {UsersService} from "@app/users/users.service";
import {UsersEntity} from "@app/users/users.entity";
import {RoomEntity} from "@app/chat/room.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {RoomHandleDto} from "@app/chat/dto/roomHandle.dto";

@Injectable()
export class ChatService {
    constructor(
        private readonly userService: UsersService,
        @InjectRepository(RoomEntity) private readonly roomRepository: Repository<RoomEntity>
    ) {}

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

    async createRoom(roomHandleDto: RoomHandleDto): Promise<RoomEntity> {
        const room = await this.roomRepository.findOne({
            name: roomHandleDto.name
        }, {
            select: ['id', 'name', 'password']
        })

        if (room)
            throw new WsException('Room exists');

        const newRoom = new RoomEntity();
        Object.assign(newRoom, roomHandleDto);
        return await this.roomRepository.save(newRoom);
    }
}
