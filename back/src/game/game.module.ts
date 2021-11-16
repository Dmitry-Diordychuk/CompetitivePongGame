import {Module} from "@nestjs/common";
import {GameService} from "@app/game/game.service";
import {GameGateway} from "@app/game/game.gateway";
import {MatchmakingService} from "@app/game/matchmaking.service";
import {ScheduleModule} from "@nestjs/schedule";

@Module({
    imports: [
        ScheduleModule.forRoot()
    ],
    controllers: [],
    providers: [GameService, GameGateway, MatchmakingService],
})
export class GameModule {}
