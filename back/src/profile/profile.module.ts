import {Module} from "@nestjs/common";
import {ProfileController} from "@app/profile/profile.controller";
import {ProfileService} from "@app/profile/profile.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserModule} from "@app/user/user.module";
import {ProfileEntity} from "@app/profile/profile.entity";
import {UserEntity} from "@app/user/user.entity";
import {MatchModule} from "@app/match/match.module";

@Module({
    imports: [TypeOrmModule.forFeature([ProfileEntity, UserEntity]), UserModule, MatchModule],
    controllers: [ProfileController],
    providers: [ProfileService],
    exports: [ProfileService]
})
export class ProfileModule {}