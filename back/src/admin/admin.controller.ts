import {Controller, Get, Post, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import RoleGuard from "@app/shared/guards/role.guard";
import Role from "@app/user/types/role.enum";

@Controller('/api/admin')
export class AdminController {
    @UsePipes(new ValidationPipe)
    @UseGuards(RoleGuard(Role.Admin))
    @Get('')
    async makeAdmin() {
        return {test: "test"};
    }
}