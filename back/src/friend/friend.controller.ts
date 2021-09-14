import {Body, Controller, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {FriendRequestInterface} from "@app/friend/types/friendRequest.interface";
import {FriendService} from "@app/friend/friend.service";
import {User} from "@app/user/decorators/user.decorator";
import {FriendRequestChangeStatusDto} from "@app/friend/dto/friendRequestChangeStatus.dto";
import {FriendRequestsInterface} from "@app/friend/types/friendRequests.interface";

@Controller('/api/friend')
export class FriendController {
    constructor(private readonly friendService: FriendService) {}

    @UseGuards(AuthGuard)
    @Post('send/:id')
    async sendFriendRequest(
        @Param('id') receiverId: number,
        @User('id') userId: number
    ): Promise<FriendRequestInterface> {
        const friendRequest = await this.friendService.sendFriendRequest(receiverId, userId);
        return this.friendService.buildFriendRequestResponse(friendRequest);
    }

    @UseGuards(AuthGuard)
    @Get('status/:id')
    async getFriendRequestStatus(
        @Param('id') receiverId: number,
        @User('id') userId: number
    ): Promise<FriendRequestInterface> {
        const friendRequest = await this.friendService.getFriendRequest(receiverId, userId);
        return this.friendService.buildFriendRequestResponse(friendRequest);
    }

    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    @Put('response/:requestId')
    async responseToFriendRequest(
        @Param('requestId') friendRequestId: number,
        @Body() changeStatusDto: FriendRequestChangeStatusDto,
        @User('id') userId: number
    ): Promise<FriendRequestInterface> {
        const friendRequest = await this.friendService.responseToFriendRequest(
            changeStatusDto.status,
            friendRequestId,
            userId
        );
        return this.friendService.buildFriendRequestResponse(friendRequest);
    }

    @UseGuards(AuthGuard)
    @Get('received-requests')
    async getCurrentUserReceivedFriendRequests(
        @User('id') currentUserId: number
    ): Promise<FriendRequestsInterface> {
        return await this.friendService.getCurrentUserReceivedFriendRequests(currentUserId);
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getCurrentUserFriends(
        @User('id') currentUserId: number
    ): Promise<FriendRequestsInterface> {
        return await this.friendService.getCurrentUserFriends(currentUserId);
    }
}