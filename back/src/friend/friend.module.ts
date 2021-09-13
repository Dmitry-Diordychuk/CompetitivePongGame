import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {FriendService} from "@app/friend/friend.service";
import {FriendController} from "@app/friend/friend.controller";
import {ProfileModule} from "@app/profile/profile.module";
import {FriendRequestEntity} from "@app/friend/friendRequest.entity";

@Module({
    imports: [TypeOrmModule.forFeature([FriendRequestEntity]), ProfileModule],
    controllers: [FriendController],
    providers: [FriendService],
    exports: []
})
export class FriendModule {}
