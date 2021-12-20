import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Put,
    Query, UploadedFile,
    UseGuards, UseInterceptors,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {UserService} from "@app/user/user.service";
import {User} from "@app/user/decorators/user.decorator";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";
import {UpdateUserDto} from "@app/user/dto/updateUser.dto";
import {UsersResponseInterface} from "@app/user/types/usersResponse.interface";
import {Express} from "express";
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from 'multer';
import RoleGuard from "@app/shared/guards/role.guard";
import Role from "@app/user/types/role.enum";

@Controller("api/user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/login')
    async createUser(@Query("code") code: string): Promise<UserResponseInterface> {
        const user = await this.userService.ftAuth(code);
        return this.userService.buildUserResponse(user);
    }

    @UseGuards(RoleGuard(Role.User))
    @Get('')
    async getCurrentUser(@User('id') currentUserId): Promise<UserResponseInterface> {
        const user = await this.userService.getCurrentUser(currentUserId);
        return this.userService.buildUserResponse(user);
    }

    @UseGuards(RoleGuard(Role.User))
    @UsePipes(new ValidationPipe)
    @Put('')
    async updateCurrentUser(
        @User('id') currentUserId,
        @Body('user') updateUserDto: UpdateUserDto
    ): Promise<UserResponseInterface> {
        const user = await this.userService.updateCurrentUser(currentUserId, updateUserDto);
        return this.userService.buildUserResponse(user);
    }

    @UseGuards(RoleGuard(Role.User))
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploadedFiles/avatars'
        })
    }))

    @UseGuards(RoleGuard(Role.User))
    @Put('avatar')
    async uploadUserAvatar(
        @User() currentUser,
        @UploadedFile() file: Express.Multer.File
    ) {
        const updateUserDto = {
            "username": currentUser.username,
            "image": file.path,
        }
        return await this.userService.updateCurrentUser(currentUser.id, updateUserDto);
    }

    @UseGuards(RoleGuard(Role.User))
    @Get('/friends')
    async getCurrentUserFriends(
        @User('id') currentUserId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.getCurrentUserFriends(currentUserId);
        return this.userService.buildUsersResponse(friends);
    }

    @UseGuards(RoleGuard(Role.User))
    @UsePipes(new ParseIntPipe())
    @Put('/friends/:friendId')
    async addUserToCurrentUserFriendList(
        @User('id') currentUserId: number,
        @Param('friendId') friendId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.addUserToCurrentUserFriendList(currentUserId, friendId);
        return this.userService.buildUsersResponse(friends);
    }

    @UseGuards(RoleGuard(Role.User))
    @UsePipes(new ParseIntPipe())
    @Delete('/friends/:friendId')
    async removeUserFromCurrentUserFriendList(
        @User('id') currentUserId: number,
        @Param('friendId') friendId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.removeUserFromCurrentUserFriendList(currentUserId, friendId);
        return this.userService.buildUsersResponse(friends);
    }

    @UseGuards(RoleGuard(Role.User))
    @Get('/blacklist')
    async getCurrentUserBlacklist(
        @User('id') currentUserId: number
    ) {
        const blacklist = await this.userService.getCurrentUserBlacklist(currentUserId);
        return this.userService.buildUsersResponse(blacklist);
    }

    @UseGuards(RoleGuard(Role.User))
    @UsePipes(new ParseIntPipe())
    @Put('/blacklist/:userId')
    async addUserToCurrentUserBlackList(
        @User('id') currentUserId: number,
        @Param('userId') targetUserId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.addUserToCurrentUserBlackList(currentUserId, targetUserId);
        return this.userService.buildUsersResponse(friends);
    }

    @UseGuards(RoleGuard(Role.User))
    @UsePipes(new ParseIntPipe())
    @Delete('/blacklist/:userId')
    async removeUserFromCurrentUserBlackList(
        @User('id') currentUserId: number,
        @Param('userId') targetUserId: number
    ): Promise<UsersResponseInterface> {
        const friends = await this.userService.removeUserFromCurrentUserBlackList(currentUserId, targetUserId);
        return this.userService.buildUsersResponse(friends);
    }

    @UseGuards(RoleGuard(Role.User))
    @UsePipes(new ParseIntPipe())
    @Get('all/:pageNumber')
    async getUsers(
        @Param('pageNumber') pageNumber: number,
    ) {
        const [result, total] = await this.userService.getAllUsers(10, pageNumber);
        return {
            result,
            total,
        };
    }
}
