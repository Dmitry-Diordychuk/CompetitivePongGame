import {Module} from "@nestjs/common";
import {GameService} from "@app/game/game.service";
import {GameGateway} from "@app/game/game.gateway";
import {MatchmakingService} from "@app/game/matchmaking.service";

@Module({
    imports: [],
    controllers: [],
    providers: [GameService, GameGateway, MatchmakingService],
})
export class GameModule {}
