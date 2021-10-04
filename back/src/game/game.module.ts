import {Module} from "@nestjs/common";
import {GameService} from "@app/game/game.service";
import {GameGateway} from "@app/game/game.gateway";

@Module({
    imports: [],
    controllers: [],
    providers: [GameService, GameGateway],
})
export class ChatModule {}
