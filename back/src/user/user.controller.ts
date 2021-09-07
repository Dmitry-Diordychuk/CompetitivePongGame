import {Controller, Get, Query} from '@nestjs/common';
import {UserService} from "@app/user/user.service";
import {User} from "@app/user/decorators/user.decorator";
import {ChannelEntity} from "@app/chat/channel.entity";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";

@Controller("api/user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/login')
    async createUser(@Query("code") code: string): Promise<UserResponseInterface> {
        const user = await this.userService.ftAuth(code);
        return this.userService.buildUserResponse(user);
    }

    // @Get('')
    // async getCurrentUser(): Promise<UserResponseInterface> {
    //
    // }

    @Get('/channels')
    async getUserChannels(
        @User('id') currentUserId: number
    ) {
        console.log(currentUserId);
        const channels: ChannelEntity[] = await this.userService.getChannelsById(currentUserId);
        console.log(channels);
    }
}
