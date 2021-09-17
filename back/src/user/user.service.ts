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
        newUser.ftId = ftId;

        const newProfile = new ProfileEntity();
        newProfile.ftProfile = ftProfile;
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
            if (user.username == updateUserDto.username) {
                throw new HttpException("This username same as previous", HttpStatus.BAD_REQUEST);
            }

            const isUsernameOccupied = await this.userRepository.findOne({username: updateUserDto.username});
            if (isUsernameOccupied) {
                throw new HttpException("This username already in use", HttpStatus.CONFLICT);
            }

            user.username = updateUserDto.username;
        }

        if (updateUserDto.image) {
            if (user.profile.image == updateUserDto.image) {
                throw new HttpException("This image same as previous", HttpStatus.BAD_REQUEST);
            }

            user.profile.image = updateUserDto.image;
        }

        return await this.userRepository.save(user);
    }

    buildUserResponse(user: UserEntity, isSecondFactorAuthenticated: boolean = false): UserResponseInterface {

        if (!user) {
            return;
        }

        const image = user.profile.image;
        const token = this.generateJwt(user, isSecondFactorAuthenticated);
        delete user.profile;
        delete user.ftId;
        delete user.twoFactorAuthenticationsSecret;
        return {
            user: {
                ...user,
                image: image,
                token: token
            }
        }
    }

    async getUserById(id: number): Promise<UserEntity> {
        return await this.userRepository.findOne(
            id,
            {
                relations: ["profile"],
                select: ["id", "username", "ftId", "isTwoFactorAuthenticationEnable", "twoFactorAuthenticationsSecret"]
        });
    }

    async getUserByFtId(ftId: number): Promise<UserEntity> {
        return await this.userRepository.findOne({
            ftId: ftId
        }, { relations: ["profile"] });
    }

    async getChannelsByUserId(currentUserId): Promise<ChannelEntity[]> {
        const user = await this.userRepository.findOne({
            relations: ['connections'],
            where: { id: currentUserId }
        });
        return user.connections;
    }

    generateJwt(user: UserEntity, isSecondFactorAuthenticated: boolean = false): string {
        const payload: TokenPayloadInterface = {
            id: user.id,
            ftId: user.ftId,
            username: user.username,
            isSecondFactorAuthenticated
        }
        return sign(
            payload,
            JWT_SECRET
        );
    }

    decodeJwt(token: string): TokenPayloadInterface | null {
        try {
            return verify(token, JWT_SECRET);
        }
        catch {
            return null;
        }
    }

    async getUserFromToken(token: string): Promise<UserEntity> {
        const payload = this.decodeJwt(token);

        const user = await this.getUserById(payload.id);

        if (!user || user.ftId != payload.ftId || user.username != payload.username) {
            return null;
        }

        return user;
    }

    async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
        return this.userRepository.update(userId, {
            twoFactorAuthenticationsSecret: secret
        })
    }

    async turnOnTwoFactorAuthentication(userId: number) {
        return this.userRepository.update(userId, {
            isTwoFactorAuthenticationEnable: true
        })
    }
}
