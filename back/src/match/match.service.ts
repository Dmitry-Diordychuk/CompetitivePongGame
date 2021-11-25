import {Injectable} from "@nestjs/common";
import {MatchEntity} from "@app/match/match.entity";
import {ProfileEntity} from "@app/profile/profile.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(MatchEntity) private readonly matchRepository: Repository<MatchEntity>,
    ) {}

    async createMatch(type: 'duel' | 'ladder', winner: ProfileEntity, loser: ProfileEntity): Promise<MatchEntity> {
        let match: MatchEntity = new MatchEntity();
        match.type = type;
        match.winner = winner;
        match.loser = loser;
        return await this.matchRepository.save(match);
    }
}