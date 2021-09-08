import {Module} from "@nestjs/common";
import {ProfileController} from "@app/profile/profile.controller";
import {ProfileService} from "@app/profile/profile.service";

@Module({
    imports: [],
    controllers: [ProfileController],
    providers: [ProfileService]
})
export class ProfileModule {}