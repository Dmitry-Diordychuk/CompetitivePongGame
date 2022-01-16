import {
    Body,
    Controller,
    Delete,
    Get, HttpException, HttpStatus,
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
import {randomInt} from "crypto";

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
        const user = await this.userService.updateCurrentUsername(currentUserId, updateUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Put('avatar')
    @UseGuards(RoleGuard(Role.User))
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: '../uploadedFiles/avatars',
            filename: (req, file, cb) => {
                cb(null, Date.now() + randomInt(1, 100000000) + '-' + file.originalname);
            },
        })
    }))
    async uploadUserAvatar(
        @User() currentUser,
        @UploadedFile() file: Express.Multer.File
    ) {
        const updateUserDto = {
            "username": currentUser.username,
            "image": "http://localhost:3001/avatars/" + file.path.split(`\\`)[3], // Fix for linux / windows \\
        }
        return await this.userService.updateCurrentUserImage(currentUser.id, updateUserDto);
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
        const take = 10;
        if (pageNumber < 1)
            return new HttpException("Wrong page number", HttpStatus.BAD_REQUEST);
        const skip = (pageNumber - 1) * take;
        const [result, total] = await this.userService.getAllUsers(take, skip);
        return {
            result,
            total,
        };
    }
}
