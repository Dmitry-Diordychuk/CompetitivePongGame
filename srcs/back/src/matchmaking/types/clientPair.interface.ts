import {GameClientInterface} from "@app/matchmaking/types/gameClient.interface";

export class ClientPairInterface {
    clientA: GameClientInterface;
    clientB: GameClientInterface;
    timeoutFunctionName: string;
    intervalFunctionName: string;
    gameMode: 'default' | 'modded';
}