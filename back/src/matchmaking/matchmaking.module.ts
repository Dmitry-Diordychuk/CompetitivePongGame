import {forwardRef, Module} from "@nestjs/common";
import {MatchmakingService} from "@app/matchmaking/matchmaking.service";
import {ScheduleModule} from "@nestjs/schedule";
import {MatchmakingGateway} from "@app/matchmaking/matchmaking.gateway";
import {GameModule} from "@app/game/game.module";
import {ClientInfoService} from "@app/clientInfo/clientInfo.service";
import {ProfileModule} from "@app/profile/profile.module";
import {UserModule} from "@app/user/user.module";
import {ClientInfoModule} from "@app/clientInfo/clientInfo.module";


@Module({
    imports: [
        ScheduleModule.forRoot(),
        forwardRef(() => GameModule),
        ProfileModule,
        UserModule,
        ClientInfoModule,
    ],
    controllers: [],
    providers: [MatchmakingGateway, MatchmakingService],
    exports: []
})
export class MatchmakingModule {}
