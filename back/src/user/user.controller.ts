import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Put,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {UserService} from "@app/user/user.service";
import {User} from "@app/user/decorators/user.decorator";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {UpdateUserDto} from "@app/user/dto/updateUser.dto";
import {UsersResponseInterface} from "@app/user/types/usersResponse.interface";

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

    @UseGuards(AuthGuard)
    @Get('/friends')
    async getCurrentUserFriends(
        @User('id') currentUserId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.getCurrentUserFriends(currentUserId);
        return this.userService.buildUsersResponse(friends);
    }

    @UseGuards(AuthGuard)
    @UsePipes(new ParseIntPipe())
    @Put('/friends/:friendId')
    async addUserToCurrentUserFriendList(
        @User('id') currentUserId: number,
        @Param('friendId') friendId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.addUserToCurrentUserFriendList(currentUserId, friendId);
        return this.userService.buildUsersResponse(friends);
    }

    @UseGuards(AuthGuard)
    @UsePipes(new ParseIntPipe())
    @Delete('/friends/:friendId')
    async removeUserFromCurrentUserFriendList(
        @User('id') currentUserId: number,
        @Param('friendId') friendId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.removeUserFromCurrentUserFriendList(currentUserId, friendId);
        return this.userService.buildUsersResponse(friends);
    }

    //TODO: counter поменять во всех multiple
    @UseGuards(AuthGuard)
    @Get('/blacklist')
    async getCurrentUserBlacklist(
        @User('id') currentUserId: number
    ) {
        const blacklist = await this.userService.getCurrentUserBlacklist(currentUserId);
        return this.userService.buildUsersResponse(blacklist);
    }

    @UseGuards(AuthGuard)
    @UsePipes(new ParseIntPipe())
    @Put('/blacklist/:userId')
    async addUserToCurrentUserBlackList(
        @User('id') currentUserId: number,
        @Param('userId') targetUserId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.addUserToCurrentUserBlackList(currentUserId, targetUserId);
        return this.userService.buildUsersResponse(friends);
    }

    @UseGuards(AuthGuard)
    @UsePipes(new ParseIntPipe())
    @Delete('/blacklist/:userId')
    async removeUserFromCurrentUserBlackList(
        @User('id') currentUserId: number,
        @Param('userId') targetUserId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.removeUserFromCurrentUserBlackList(currentUserId, targetUserId);
        return this.userService.buildUsersResponse(friends);
    }
}
