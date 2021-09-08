import {Module} from "@nestjs/common";
import {ProfileController} from "@app/profile/profile.controller";
import {ProfileService} from "@app/profile/profile.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserModule} from "@app/user/user.module";
import {ProfileEntity} from "@app/profile/profile.entity";
import {UserEntity} from "@app/user/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ProfileEntity, UserEntity]), UserModule],
    controllers: [ProfileController],
    providers: [ProfileService]
})
export class ProfileModule {}