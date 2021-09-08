import {Controller, Get, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {ProfileService} from "@app/profile/profile.service";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {User} from "@app/user/decorators/user.decorator";

@Controller('/api/profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @UsePipes(new ValidationPipe)
    @UseGuards(AuthGuard)
    @Get('')
    async getCurrentUserProfile(@User('id') currentUserId: number) {
        const user = await this.profileService.getCurrentUserProfile(currentUserId);
        return this.profileService.buildProfileResponse(user);
    }
}