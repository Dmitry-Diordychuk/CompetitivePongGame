import {Injectable} from "@nestjs/common";
import {Interval} from "@nestjs/schedule";

@Injectable()
export class ClientInfoService {
    clientInfo = [];

    // @Interval(1000)
    // log() {
    //     console.log(this.clientInfo);
    // }

    setClientInfo(userId, socketId, roomName, playerNumber) {
        this.clientInfo.push({
            userId,
            socketId,
            roomName,
            playerNumber,
        });
    }

    getClientInfo(socketId) {
        const record = this.clientInfo.find(i => i.socketId === socketId);
        return record;
    }

    getUserRoom(userId) {
        const record = this.clientInfo.find(i => i.userId === userId);
        if (record)
            return record.roomName;
        return null;
    }

    getClientRoom(clientId) {
        const record = this.clientInfo.find(i => i.socketId === clientId);
        if (record)
            return record.roomName;
        return null;
    }

    getClientPlayerNumber(clientId) {
        const record = this.clientInfo.find(i => i.socketId === clientId);
        if (record)
            return record.playerNumber;
        return null;
    }

    destroyRoom(roomName) {
        this.clientInfo = this.clientInfo.filter(i => i.roomName !== roomName);
    }

    removeSocket(socketId) {
        this.clientInfo = this.clientInfo.filter(i => i.socketId !== socketId);
    }

    renewClientSocket(userId, socketId) {
        const record = this.clientInfo.find(i => i.userId === userId);
        if (record)
            record.socketId = socketId;
    }

    // removeClientSocket(userId) {
    //     const record = this.clientInfo.find(i => i.userId === userId);
    //     if (record)
    //         record.socketId = null;
    // }
}