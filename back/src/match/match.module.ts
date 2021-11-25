import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MatchService} from "@app/match/match.service";
import {MatchController} from "@app/match/match.controller";
import {MatchEntity} from "@app/match/match.entity";

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity])],
    controllers: [MatchController],
    providers: [MatchService],
    exports: [MatchService],
})
export class MatchModule {}