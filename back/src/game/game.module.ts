import {Module} from "@nestjs/common";
import {GameService} from "@app/game/game.service";
import {GameGateway} from "@app/game/game.gateway";
import {MatchmakingModule} from "@app/matchmaking/matchmaking.module";
import {ScheduleModule} from "@nestjs/schedule";
import {UserModule} from "@app/user/user.module";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MatchmakingModule,
        UserModule
    ],
    controllers: [],
    providers: [GameService, GameGateway],
    exports: [GameService]
})
export class GameModule {}
