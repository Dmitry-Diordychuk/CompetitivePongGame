import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Put,
    UseGuards,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import {User} from "@app/user/decorators/user.decorator";
import {MatchService} from "@app/match/match.service";
import {AddCommentDto} from "@app/match/dto/addComment.dto";
import {MatchEntity} from "@app/match/match.entity";
import Role from "@app/user/types/role.enum";
import RoleGuard from "@app/shared/guards/role.guard";

@Controller("api/match")
@UseGuards(RoleGuard(Role.User))
export class MatchController {
    constructor(
        private readonly matchService: MatchService,
    ) {
    }

    @UsePipes(new ParseIntPipe())
    @Get('/user/:id')
    async getUserMatches(
        @Param('id') userId: number
    ) {
        const matches = await this.matchService.findUserMatches(userId);
        return matches;
    }

    @UsePipes(new ValidationPipe)
    @Put('/comment')
    async addComment(
        @User('id') userId: number,
        @Body('message') addCommentDto: AddCommentDto,
    ): Promise<MatchEntity> {
        return await this.matchService.addComment(addCommentDto.matchId, userId, addCommentDto.message);
    }

    @UsePipes(new ParseIntPipe())
    @Delete('/:id/comment/:comment_id')
    async deleteComment(
        @User() userId: number,
        @Param('id') matchId: number,
        @Param('comment_id') commentId: number,
    ): Promise<MatchEntity> {
        return await this.matchService.deleteComment(matchId, userId, commentId);
    }
}
