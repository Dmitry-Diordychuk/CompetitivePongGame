import {Controller, Get, Param, Post, UseGuards} from "@nestjs/common";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {FriendRequestInterface} from "@app/friend/types/friendRequest.interface";
import {FriendService} from "@app/friend/friend.service";
import {User} from "@app/user/decorators/user.decorator";

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
        console.log(friendRequest);
        return this.friendService.buildFriendRequestResponse(friendRequest);
    }
}