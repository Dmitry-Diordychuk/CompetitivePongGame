import {Module} from "@nestjs/common";
import {GameService} from "@app/game/game.service";
import {GameGateway} from "@app/game/game.gateway";
import {MatchmakingModule} from "@app/matchmaking/matchmaking.module";
import {ScheduleModule} from "@nestjs/schedule";
import {UserModule} from "@app/user/user.module";
import {ClientInfoService} from "@app/clientInfo/clientInfo.service";
import {ClientInfoModule} from "@app/clientInfo/clientInfo.module";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MatchmakingModule,
        UserModule,
        ClientInfoModule,
    ],
    controllers: [],
    providers: [GameService, GameGateway],
    exports: [GameService]
})
export class GameModule {}
