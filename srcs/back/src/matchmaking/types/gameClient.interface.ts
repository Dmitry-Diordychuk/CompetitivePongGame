import {UserEntity} from "@app/user/user.entity";
import {Socket} from "socket.io";


export class GameClientInterface {
    user: UserEntity;
    queueEntryTime: number;
    socket: Socket;
    isGameAccepted: boolean;
}