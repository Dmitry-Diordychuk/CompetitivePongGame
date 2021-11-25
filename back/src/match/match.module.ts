import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MatchService} from "@app/match/match.service";
import {MatchController} from "@app/match/match.controller";
import {MatchEntity} from "@app/match/match.entity";
import {CommentEntity} from "@app/match/comment.entity";
import {UserModule} from "@app/user/user.module";

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity, CommentEntity]), UserModule],
    controllers: [MatchController],
    providers: [MatchService],
    exports: [MatchService],
})
export class MatchModule {}