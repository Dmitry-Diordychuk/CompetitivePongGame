import {PlayerRacketInterface} from "@app/game/types/playerRacketInterface";
import {BallInterface} from "@app/game/types/ball.interface";
import {BonusInterface} from "@app/game/types/bonus.interface";
import {WallInterface} from "@app/game/types/wall.interface";

export class GameStateInterface {
    players: PlayerRacketInterface[];
    ball: BallInterface;
    gridSize: number;
    roundCounter: number;
    roundResult: number[];
    bonus: BonusInterface;
    bonuses: BonusInterface[] | null;
    walls: WallInterface[] | null;
}