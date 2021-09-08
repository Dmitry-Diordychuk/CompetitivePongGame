import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {ChatService} from "@app/chat/chat.service";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {User} from "@app/user/decorators/user.decorator";
import {ChannelsResponseInterface} from "@app/chat/types/channelsResponse.interface";

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
    async getChannelInfo(@Param('id') channel_id: number) {
        return await this.chatService.getChannel(channel_id);
    }
}
