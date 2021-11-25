import {Body, Controller, Delete, Param, ParseIntPipe, Put, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import {User} from "@app/user/decorators/user.decorator";
import {MatchService} from "@app/match/match.service";
import {AddCommentDto} from "@app/match/dto/addComment.dto";
import {MatchEntity} from "@app/match/match.entity";

@Controller("api/match")
export class MatchController {
    constructor(
        private readonly matchService: MatchService,
    ) {
    }

    @UsePipes(new ValidationPipe)
    @UseGuards(AuthGuard)
    @Put('/comment')
    async addComment(
        @User('id') userId: number,
        @Body('message') addCommentDto: AddCommentDto,
    ): Promise<MatchEntity> {
        return await this.matchService.addComment(addCommentDto.matchId, userId, addCommentDto.message);
    }

    @UsePipes(new ParseIntPipe())
    @UseGuards(AuthGuard)
    @Delete('/:id/comment/:comment_id')
    async deleteComment(
        @User() userId: number,
        @Param('id') matchId: number,
        @Param('comment_id') commentId: number,
    ): Promise<MatchEntity> {
        return await this.matchService.deleteComment(matchId, userId, commentId);
    }
}
