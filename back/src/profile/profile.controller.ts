import {Controller, Get, Param, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {ProfileService} from "@app/profile/profile.service";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {User} from "@app/user/decorators/user.decorator";
import {ProfileResponseInterface} from "@app/profile/type/profileResponse.interface";

@Controller('/api/profile')
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService
    ) {}

    @UsePipes(new ValidationPipe)
    @UseGuards(AuthGuard)
    @Get('')
    async getCurrentUserProfile(@User('id') currentUserId: number): Promise<ProfileResponseInterface> {
        const user = await this.profileService.getCurrentUserWithProfile(currentUserId);
        return this.profileService.buildProfileResponse(user);
    }

    @Get(':id')
    async getProfile(@Param('id') profile_id: number): Promise<ProfileResponseInterface> {
        const user = await this.profileService.getUserWithProfileById(profile_id);
        return this.profileService.buildProfileResponse(user);
    }
}