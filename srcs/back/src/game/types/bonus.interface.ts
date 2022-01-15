import {PositionInterface} from "@app/game/types/position.interface";

export class BonusInterface {
    position: PositionInterface;
    type: string;
    lifetime: number;
}