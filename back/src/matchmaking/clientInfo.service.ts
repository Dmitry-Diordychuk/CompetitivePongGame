import {Injectable} from "@nestjs/common";

@Injectable()
export class ClientInfoService {
    clientInfo = [];

    setClientInfo(userId, socketId, roomName, playerNumber) {
        this.clientInfo.push({
            userId,
            socketId,
            roomName,
            playerNumber,
        });
    }

    getUserSocket(userId) {
        const record = this.clientInfo.find(i => i.userId === userId);
        if (record)
            return record.socketId;
        return null;
    }

    getUserRoom(userId) {
        const record = this.clientInfo.find(i => i.userId === userId);
        if (record)
            return record.roomName;
        return null;
    }

    getClientRoom(clientId) {
        const record = this.clientInfo.find(i => i.clientId === clientId);
        if (record)
            return record.roomName;
        return null;
    }

    getClientPlayerNumber(clientId) {
        const record = this.clientInfo.find(i => i.clientId === clientId);
        if (record)
            return record.playerNumber;
        return null;
    }

    removeClientInfo(roomName) {
        this.clientInfo = this.clientInfo.filter(i => i.roomName !== roomName);
    }
}