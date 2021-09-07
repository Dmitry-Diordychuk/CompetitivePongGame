import {Controller, Get, UseGuards} from '@nestjs/common';
import {ChatService} from "@app/chat/chat.service";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {User} from "@app/user/decorators/user.decorator";
import {ChannelsResponseInterface} from "@app/chat/types/channelsResponse.interface";

@Controller("api")
export class ChannelController {
    constructor(
        private readonly chatService: ChatService,
    ) {}

    // @Get('channel:id')
    // async getChannelInfo(@Param('id') channel_id) {
    //
    // }

    @UseGuards(AuthGuard)
    @Get('channels')
    async getUserChannels(
        @User('id') currentUserId: number,
    ): Promise<ChannelsResponseInterface> {
        return await this.chatService.getUserChannels(currentUserId);
    }
}
