import {PlayerInterface} from "@app/game/types/player.interface";
import {BallInterface} from "@app/game/types/ball.interface";

export class GameStateInterface {
    players: PlayerInterface[];
    ball: BallInterface;
    gridSize: number;
}