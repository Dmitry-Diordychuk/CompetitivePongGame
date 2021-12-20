import {Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import RoleGuard from "@app/shared/guards/role.guard";
import Role from "@app/user/types/role.enum";
import {UserService} from "@app/user/user.service";
import {AdminService} from "@app/admin/admin.service";
import {UserEntity} from "@app/user/user.entity";
import {UpdateResult} from "typeorm";
import {UpdateUserDto} from "@app/user/dto/updateUser.dto";
import {UpdateChannelAdminDto} from "@app/admin/dto/updateChannelAdmin.dto";

@Controller('/api/admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @UseGuards(RoleGuard(Role.Owner))
    @UsePipes(new ParseIntPipe())
    @Post('/:id')
    async makeAdmin(
        @Param('id') targetId: number
    ) {
        const result: UpdateResult = await this.adminService.makeAdmin(targetId);
        return {
            affected: result.affected,
        }
    }

    @UseGuards(RoleGuard(Role.Admin))
    @UsePipes(new ParseIntPipe())
    @Post('/ban/:id')
    async banUser(
        @Param('id') targetId: number
    ) {
        const result: UpdateResult = await this.adminService.banUser(targetId);
        return {
            affected: result.affected,
        }
    }

    @UseGuards(RoleGuard(Role.Admin))
    @UsePipes(new ParseIntPipe())
    @Post('/destroy/channel/:id')
    async destroyChannel(
        @Param('id') channelId: number
    ) {
        const channel = await this.adminService.destroyChannel(channelId);
        return channel;
    }

    @UseGuards(RoleGuard(Role.Admin))
    @UsePipes(new ValidationPipe())
    @Post('/make/channel/owner')
    async makeChannelOwner(
        @Body('user') updateChannelAdminDto: UpdateChannelAdminDto
    ) {
        const channel = await this.adminService.makeChannelOwner(updateChannelAdminDto.channelId, updateChannelAdminDto.userId);
        return channel;
    }

    @UseGuards(RoleGuard(Role.Admin))
    @UsePipes(new ParseIntPipe())
    @Post('/remove/channel/owner/:id')
    async removeChannelOwner(
        @Param('id') channelId: number
    ) {
        const channel = await this.adminService.removeChannelOwner(channelId);
        return channel;
    }

    @UseGuards(RoleGuard(Role.Admin))
    @UsePipes(new ValidationPipe())
    @Post('/make/channel/admin')
    async makeChannelAdmin(
        @Body('user') updateChannelAdminDto: UpdateChannelAdminDto
    ) {
        const channel = await this.adminService.makeChannelAdmin(updateChannelAdminDto.channelId, updateChannelAdminDto.userId);
        return channel;
    }

    @UseGuards(RoleGuard(Role.Admin))
    @UsePipes(new ValidationPipe())
    @Post('/remove/channel/admin')
    async removeChannelAdmin(
        @Body('user') updateChannelAdminDto: UpdateChannelAdminDto
    ) {
        const channel = await this.adminService.removeChannelAdmin(updateChannelAdminDto.channelId, updateChannelAdminDto.userId);
        return channel;
    }
}