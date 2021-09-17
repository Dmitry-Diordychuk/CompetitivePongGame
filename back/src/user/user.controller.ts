import {Body, Controller, Get, Put, Query, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {UserService} from "@app/user/user.service";
import {User} from "@app/user/decorators/user.decorator";
import {ChannelEntity} from "@app/chat/channel.entity";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {UpdateUserDto} from "@app/user/dto/updateUser.dto";

@Controller("api/user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/login')
    async createUser(@Query("code") code: string): Promise<UserResponseInterface> {
        const user = await this.userService.ftAuth(code);
        return this.userService.buildUserResponse(user);
    }

    @UseGuards(AuthGuard)
    @Get('')
    async getCurrentUser(@User('id') currentUserId): Promise<UserResponseInterface> {
        const user = await this.userService.getCurrentUser(currentUserId);
        return this.userService.buildUserResponse(user);
    }

    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe)
    @Put('')
    async updateCurrentUser(
        @User('id') currentUserId,
        @Body('user') updateUserDto: UpdateUserDto
    ): Promise<UserResponseInterface> {
        const user = await this.userService.updateCurrentUser(currentUserId, updateUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Get('/channels')
    async getUserChannels(
        @User('id') currentUserId: number
    ) {
        // TODO: что тут происходит?
        const channels: ChannelEntity[] = await this.userService.getChannelsByUserId(currentUserId);
    }
}
