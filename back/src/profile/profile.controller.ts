import {Controller, Get} from "@nestjs/common";
import {ProfileService} from "@app/profile/profile.service";

@Controller('/api/profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get('')
    getCurrentUserProfile() {
        return this.profileService.getCurrentUserProfile();
    }
}