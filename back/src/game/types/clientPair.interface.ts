import {GameClientInterface} from "@app/game/types/gameClient.interface";

export class ClientPairInterface {
    clientA: GameClientInterface;
    clientB: GameClientInterface;
    timeoutFunctionName: string;
    intervalFunctionName: string;
}