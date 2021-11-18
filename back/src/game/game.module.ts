import {Module} from "@nestjs/common";
import {GameService} from "@app/game/game.service";
import {GameGateway} from "@app/game/game.gateway";
import {MatchmakingModule} from "@app/matchmaking/matchmaking.module";

@Module({
    imports: [MatchmakingModule],
    controllers: [],
    providers: [GameService, GameGateway],
    exports: [GameService]
})
export class GameModule {}
