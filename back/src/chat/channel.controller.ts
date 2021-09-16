import {Body, Controller, Get, Param, Put, UseGuards} from '@nestjs/common';
import {ChatService} from "@app/chat/chat.service";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {User} from "@app/user/decorators/user.decorator";
import {ChannelsResponseInterface} from "@app/chat/types/channelsResponse.interface";
import {MakeAdminDto} from "@app/chat/dto/makeAdminDto";
import {ChannelResponseInterface} from "@app/chat/types/channelResponse.interface";

@Controller("api/channel")
export class ChannelController {
    constructor(
        private readonly chatService: ChatService,
    ) {}

    @UseGuards(AuthGuard)
    @Get('all')
    async getUserChannels(
        @User('id') currentUserId: number,
    ): Promise<ChannelsResponseInterface> {
        return await this.chatService.getUserOpenChannels(currentUserId);
    }

    @Get(':id')
    async getChannelInfo(
        @Param('id') channel_id: number
    ): Promise<ChannelResponseInterface> {
        return await this.chatService.getChannel(channel_id);
    }

    @Put('admin/:userId')
    async makeUserChannelAdmin(
        @Param('id') userId: number,
        @User('id') currentUserId: number,
        @Body() makeAdminDto: MakeAdminDto
    ): Promise<ChannelResponseInterface> {
        const channel = await this.chatService.makeAdmin(currentUserId, makeAdminDto.userId, makeAdminDto.channelId);
        return {channel};
    }
}
