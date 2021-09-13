import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ProfileEntity} from "@app/profile/profile.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ProfileEntity, FriendModule])],
    controllers: [],
    providers: [],
    exports: []
})
export class FriendModule {}
