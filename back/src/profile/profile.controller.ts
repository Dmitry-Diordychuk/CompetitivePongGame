import {Controller, Get, Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {ProfileService} from "@app/profile/profile.service";
import {User} from "@app/user/decorators/user.decorator";
import {ProfileResponseInterface} from "@app/profile/type/profileResponse.interface";
import RoleGuard from "@app/shared/guards/role.guard";
import Role from "@app/user/types/role.enum";

@Controller('/api/profile')
@UseGuards(RoleGuard(Role.User))
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService
    ) {}

    @UsePipes(new ValidationPipe)
    @Get('')
    async getCurrentUserProfile(@User('id') currentUserId: number): Promise<ProfileResponseInterface> {
        const user = await this.profileService.getCurrentUserWithProfile(currentUserId);
        return this.profileService.buildProfileResponse(user);
    }

    @UsePipes(new ParseIntPipe())
    @Get(':id')
    async getProfile(@Param('id') profile_id: number): Promise<ProfileResponseInterface> {
        const user = await this.profileService.getUserWithProfileById(profile_id);
        return this.profileService.buildProfileResponse(user);
    }
}