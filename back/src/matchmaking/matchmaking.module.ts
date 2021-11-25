import {forwardRef, Module} from "@nestjs/common";
import {MatchmakingService} from "@app/matchmaking/matchmaking.service";
import {ScheduleModule} from "@nestjs/schedule";
import {MatchmakingGateway} from "@app/matchmaking/matchmaking.gateway";
import {GameModule} from "@app/game/game.module";
import {ClientInfoService} from "@app/matchmaking/clientInfo.service";
import {ProfileModule} from "@app/profile/profile.module";


@Module({
    imports: [
        ScheduleModule.forRoot(),
        forwardRef(() => GameModule),
        ProfileModule,
    ],
    controllers: [],
    providers: [MatchmakingGateway, MatchmakingService, ClientInfoService],
    exports: [ClientInfoService]
})
export class MatchmakingModule {}
