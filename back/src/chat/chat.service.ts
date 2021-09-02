import { Injectable } from '@nestjs/common';
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {UsersService} from "@app/users/users.service";
import {UsersEntity} from "@app/users/users.entity";
import {RoomEntity} from "@app/chat/room.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {RoomHandleDto} from "@app/chat/dto/roomHandle.dto";
import {compare} from "bcrypt";

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
        try {
            return await this.userService.getUserFromToken(token);
        }
        catch {
            throw new WsException('jwt malformed');
        }
    }

    async findRoomByName(name: string) {
        return await this.roomRepository.findOne({
            name: name
        }, {
            select: ['id', 'name', 'password']
        });
    }

    async createGeneralRoom(): Promise<RoomEntity> {
        const general = await this.findRoomByName('general');

        if (!general) {
            const newRoom = new RoomEntity();
            newRoom.name = "general";
            newRoom.password = null;
            return await this.roomRepository.save(newRoom);
        }
        return general;
    }

    async createRoom(roomHandleDto: RoomHandleDto): Promise<RoomEntity> {
        const room = await this.findRoomByName(roomHandleDto.name);

        if (room)
            throw new WsException("Room " + roomHandleDto.name + " exist!");

        const newRoom = new RoomEntity();
        Object.assign(newRoom, roomHandleDto);
        return await this.roomRepository.save(newRoom);
    }

    async tryRoomPassword(room: RoomEntity, password: string): Promise<boolean> {
        if (room.password === null && password === null) {
            return true;
        }
        if (room.password === null || password === null) {
            return false;
        }
        if (await compare(password, room.password, null)) {
            return true;
        }
        return false;
    }
}
