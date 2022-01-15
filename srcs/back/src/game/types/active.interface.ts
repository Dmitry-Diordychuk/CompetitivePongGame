import {PositionInterface} from "@app/game/types/position.interface";
import {PlayerRacketInterface} from "@app/game/types/playerRacketInterface";

export class ActiveInterface {
    type: string;
    lifetime: number;
    wall: PlayerRacketInterface;
}