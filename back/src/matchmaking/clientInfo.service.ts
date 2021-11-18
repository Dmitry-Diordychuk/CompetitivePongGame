import {Injectable} from "@nestjs/common";

@Injectable()
export class ClientInfoService {
    clientRooms = {};
    playerNumbers = {};

    setClientRoom(clientId, roomName) {
        this.clientRooms[clientId] = roomName;
    }

    setClientPlayerNumber(clientId, playerNumber) {
        this.playerNumbers[clientId] = playerNumber;
    }

    getClientRoom(clientId) {
        return this.clientRooms[clientId];
    }

    getClientPlayerNumber(clientId) {
        return this.playerNumbers[clientId];
    }

    removeClientInfo(clientId) {
        delete this.clientRooms[clientId];
        delete this.playerNumbers[clientId];
    }
}