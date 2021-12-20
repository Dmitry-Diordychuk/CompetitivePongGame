import {Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {ChatService} from "@app/chat/chat.service";
import {User} from "@app/user/decorators/user.decorator";
import {ChannelsResponseInterface} from "@app/chat/types/channelsResponse.interface";
import {MakeAdminDto} from "@app/chat/dto/makeAdmin.dto";
import {ChannelResponseInterface} from "@app/chat/types/channelResponse.interface";
import Role from "@app/user/types/role.enum";
import RoleGuard from "@app/shared/guards/role.guard";

@Controller("api/channel")
@UseGuards(RoleGuard(Role.User))
export class ChannelController {
    constructor(
        private readonly chatService: ChatService,
    ) {}

    @Get('all/public')
    async getAllPublicChannels(): Promise<ChannelsResponseInterface> {
        return await this.chatService.getAllPublicChannels();
    }

    @Get('all/current')
    async getUserChannels(
        @User('id') currentUserId: number,
    ): Promise<ChannelsResponseInterface> {
        return await this.chatService.getUserOpenChannels(currentUserId);
    }

    @UsePipes(new ParseIntPipe())
    @Get(':id')
    async getChannelInfo(
        @Param('id') channel_id: number
    ): Promise<ChannelResponseInterface> {
        return await this.chatService.getChannel(channel_id);
    }

    @UsePipes(new ValidationPipe())
    @Put('admin')
    async makeUserChannelAdmin(
        @User('id') currentUserId: number,
        @Body() makeAdminDto: MakeAdminDto
    ): Promise<ChannelResponseInterface> {
        const channel = await this.chatService.makeAdmin(currentUserId, makeAdminDto.userId, makeAdminDto.channelId);
        return {channel};
    }

    @UsePipes(new ParseIntPipe())
    @Get('all/:pageNumber')
    async getAllChannels(
        @Param('pageNumber') pageNumber: number,
    ) {
        const [result, total] = await this.chatService.getAllChannels(10, pageNumber);
        return {
            result,
            total,
        };
    }
}
