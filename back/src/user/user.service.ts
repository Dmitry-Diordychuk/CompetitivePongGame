import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UserEntity} from "@app/user/user.entity";
import {sign, verify} from "jsonwebtoken";
import {APP_REDIRECT, APP_SECRET, APP_UID, JWT_SECRET} from "@app/config";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {ChannelEntity} from "@app/chat/channel.entity";
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";
import {UpdateUserDto} from "@app/user/dto/updateUser.dto";
import {ProfileEntity} from "@app/profile/profile.entity";


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(ChannelEntity) private readonly channelRepository: Repository<ChannelEntity>,
        private readonly httpService: HttpService
    ) {}

    async ftAuth(code: string): Promise<UserEntity> {
        const data = {
            grant_type: "authorization_code",
            client_id: APP_UID,
            client_secret: APP_SECRET,
            code: code,
            redirect_uri: encodeURI(APP_REDIRECT)
        };

        let token = "";
        try {
            const tokenResponse = await firstValueFrom(this.httpService.post('https://api.intra.42.fr/oauth/token', data));
            token = tokenResponse.data["access_token"];
        } catch (exception) {
            throw new HttpException("Unauthorized", 401);
        }

        /*
          data: {
                access_token: '37ad683e6f3fb009684efc9b742041c53ee722dbea3bd8aa8a74f4f39d965d64',
                token_type: 'bearer',
                expires_in: 6693,
                refresh_token: '78b1affd6ebd7de4b4888ec13747579ce72fe10bf43088345a77b149d14dafaa',
                scope: 'public',
                created_at: 1631019538
            }
         */


        const config = {
            headers: {
                Authorization: "Bearer " + token
            }
        }

        let profile = null;
        try {
            const profileResponse = await firstValueFrom(this.httpService.get('https://api.intra.42.fr/v2/me', config));
            profile = profileResponse.data;
        } catch (exception) {
            throw new HttpException("Unauthorized", 401);
        }

        const ftId = profile["id"];

        const user = await this.getUserByFtId(ftId);

        if (!user) {
            const username = profile["login"];
            const ftProfileUrl = profile["url"];
            const img = profile["image_url"];
            return await this.register(ftId, username, img, ftProfileUrl);
        }

        return user;
    }

    async register(ftId: number, username: string, img: string, ftProfile: string) {
        const newUser = new UserEntity();
        newUser.username = username;
        newUser.ft_id = ftId;

        const newProfile = new ProfileEntity();
        newProfile.ft_profile = ftProfile;
        newProfile.image = img;
        newProfile.level = 1;
        newProfile.losses = 0;
        newProfile.victories = 0;

        newUser.profile = newProfile;

        return await this.userRepository.save(newUser);
    }

    async getCurrentUser(currentUserId: number) {
        const user = await this.getUserById(currentUserId);

        if (!user) {
            throw new HttpException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return user;
    }

    async updateCurrentUser(currentUserId: number, updateUserDto: UpdateUserDto) {
        const user = await this.userRepository.findOne(currentUserId, { relations: ["profile"] });

        if (!user) {
            throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND);
        }

        if (updateUserDto.username && updateUserDto.username != "") {
            user.username = updateUserDto.username;
        }
        if (updateUserDto.image) {
            user.profile.image = updateUserDto.image;
        }
        return await this.userRepository.save(user);
    }

    buildUserResponse(user: UserEntity): UserResponseInterface {
        const image = user.profile.image;
        const token = this.generateJwt(user);
        delete user.profile;
        delete user.ft_id;
        return {
            user: {
                ...user,
                image: image,
                token: token
            }
        }
    }

    async getUserById(id: number): Promise<UserEntity> {
        return await this.userRepository.findOne(id, { relations: ["profile"] });
    }

    async getUserByFtId(ftId: number): Promise<UserEntity> {
        return await this.userRepository.findOne({
            ft_id: ftId
        }, { relations: ["profile"] });
    }

    async getChannelsByUserId(currentUserId): Promise<ChannelEntity[]> {
        const user = await this.userRepository.findOne({
            relations: ['connections'],
            where: { id: currentUserId }
        });
        return user.connections;
    }

    generateJwt(user: UserEntity): string {
        const payload: TokenPayloadInterface = {
            id: user.id,
            ft_id: user.ft_id,
            username: user.username
        }
        return sign(
            payload,
            JWT_SECRET
        );
    }

    async getUserFromToken(token: string): Promise<UserEntity> {
        let payload;
        try {
            payload = verify(token, JWT_SECRET);
        }
        catch {
            return null
        }
        return await this.getUserById(payload.id);
    }

    async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
        return this.userRepository.update(userId, {
            twoFactorAuthenticationsSecret: secret
        })
    }
}
