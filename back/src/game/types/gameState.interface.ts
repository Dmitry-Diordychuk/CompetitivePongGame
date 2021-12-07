import {PlayerRacketInterface} from "@app/game/types/playerRacketInterface";
import {BallInterface} from "@app/game/types/ball.interface";

export class GameStateInterface {
    players: PlayerRacketInterface[];
    ball: BallInterface;
    gridSize: number;
    roundCounter: number;
    roundResult: number[];
}