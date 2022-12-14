import {PlayerRacketInterface} from "@app/game/types/playerRacketInterface";
import {BallInterface} from "@app/game/types/ball.interface";
import {BonusInterface} from "@app/game/types/bonus.interface";
import {ActiveInterface} from "@app/game/types/active.interface";

export class GameStateInterface {
    players: PlayerRacketInterface[];
    ball: BallInterface;
    gridSize: number;
    roundCounter: number;
    roundResult: number[];

    bonus: BonusInterface;
    active: ActiveInterface[];

    pause: boolean;
    pauseStartTime: number;
    pausePlayerOneCounter: number;
    pausePlayerTwoCounter: number;
    step: number;
    playerSurrendered: false | 1 | 2;
}