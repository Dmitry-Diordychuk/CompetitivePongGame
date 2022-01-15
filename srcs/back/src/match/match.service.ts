import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {MatchEntity} from "@app/match/match.entity";
import {ProfileEntity} from "@app/profile/profile.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CommentEntity} from "@app/match/comment.entity";
import {UserService} from "@app/user/user.service";
import {find} from "rxjs";
import {UserEntity} from "@app/user/user.entity";

@Injectable()
export class MatchService {
    constructor(
        private readonly userService: UserService,
        @InjectRepository(MatchEntity) private readonly matchRepository: Repository<MatchEntity>,
        @InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>,
    ) {}

    async findMatch(matchId: number) {
        const match = await this.matchRepository.findOne(matchId);
        if (!match) {
            throw new HttpException("There is no such match", HttpStatus.BAD_REQUEST);
        }
        return match;
    }

    async findUserMatches(userId: number) {
        let matches = await this.matchRepository
            .createQueryBuilder('match')
            .leftJoinAndSelect(UserEntity, "winner", "match.winnerId = winner.id")
            .leftJoinAndSelect(UserEntity, "loser", "match.loserId = loser.id")
            .where("match.winnerId = :userId OR match.loserId = :userId", { userId: userId })
            .orderBy("match.create_at", 'DESC')
            .getRawMany();
        return matches;
    }

    async createMatch(type: 'duel' | 'ladder', winner: ProfileEntity, loser: ProfileEntity): Promise<MatchEntity> {
        let match: MatchEntity = new MatchEntity();
        match.type = type;
        match.winner = winner;
        match.loser = loser;
        return await this.matchRepository.save(match);
    }

    async addComment(matchId: number, userId: number, message: string) {
        const match = await this.findMatch(matchId);
        let comment: CommentEntity = new CommentEntity();
        comment.message = message;
        comment.author = await this.userService.getUserById(userId);
        comment = await this.commentRepository.save(comment);
        if (match.comments) {
            match.comments = [comment, ...match.comments];
        } else {
            match.comments = [comment];
        }
        return match;
    }

    async deleteComment(matchId: number, userId: number, commentId: number) {
        const match = await this.findMatch(matchId);
        if (match.comments) {
            const comment = await match.comments.find(c => c.id === commentId);
            if (!comment) {
                throw new HttpException("There is no such match", HttpStatus.BAD_REQUEST);
            }
            if (comment.author.id === userId) {
                match.comments = match.comments.filter(c => c.id !== commentId);
            } else {
                throw new HttpException("You're not allowed to delete this comment", HttpStatus.BAD_REQUEST);
            }
        } else {
            throw new HttpException("There is no such comment", HttpStatus.BAD_REQUEST);
        }
        return await this.matchRepository.save(match);
    }
}