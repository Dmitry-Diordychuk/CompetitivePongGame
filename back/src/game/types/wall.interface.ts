import {PositionInterface} from "@app/game/types/position.interface";

export class WallInterface {
    position: PositionInterface;
    velocity: number;
    size: number;
    range: number;
}