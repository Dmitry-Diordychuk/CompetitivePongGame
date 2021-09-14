import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {ProfileEntity} from "@app/profile/profile.entity";
import {FriendRequestInterface} from "@app/friend/types/friendRequest.interface";
import {InjectRepository} from "@nestjs/typeorm";
import {ProfileService} from "@app/profile/profile.service";
import {FriendRequestEntity} from "@app/friend/friendRequest.entity";
import {Repository} from "typeorm";
import {FriendRequestStatus, FriendRequestStatusType} from "@app/friend/types/friendRequestStatus.type";
import {FriendRequestsInterface} from "@app/friend/types/friendRequests.interface";

@Injectable()
export class FriendService {
    constructor(
        private readonly profileService: ProfileService,
        @InjectRepository(FriendRequestEntity) private readonly friendRequestRepository: Repository<FriendRequestEntity>
    ) {
    }

    async hasRequestBeenSentOrReceived(creator: ProfileEntity, receiver: ProfileEntity): Promise<boolean> {
        const match = await this.friendRequestRepository.findOne({
            where: [
                { creator: creator, receiver: receiver },
                { creator: receiver, receiver: creator }
            ]
        });

        return !!match;
    }

    async sendFriendRequest(receiverId: number, creatorId: number): Promise<FriendRequestEntity> {
        if (receiverId == creatorId) {
            throw new HttpException("Can't friend yourself", HttpStatus.BAD_REQUEST);
        }

        const creator = await this.profileService.getCurrentUserWithProfile(creatorId);

        if (!creator) {
            throw new HttpException("There is no such creator", HttpStatus.BAD_REQUEST);
        }

        const receiver = await this.profileService.getUserWithProfileById(receiverId);

        if (!receiver) {
            throw new HttpException("There is no such receiver", HttpStatus.BAD_REQUEST);
        }

        if (await this.hasRequestBeenSentOrReceived(creator.profile, receiver.profile)) {
            throw new HttpException("Friend request already exist", HttpStatus.BAD_REQUEST);
        }

        const friendRequest = new FriendRequestEntity();
        friendRequest.creator = creator.profile;
        friendRequest.receiver = receiver.profile;
        friendRequest.status = FriendRequestStatus.Pending;

        return await this.friendRequestRepository.save(friendRequest);
    }

    async getFriendRequest(receiverId: number, creatorId: number): Promise<FriendRequestEntity> {
        const creator = await this.profileService.getCurrentUserWithProfile(creatorId);

        if (!creator) {
            throw new HttpException("There is no such creator", HttpStatus.BAD_REQUEST);
        }

        const receiver = await this.profileService.getUserWithProfileById(receiverId);

        if (!receiver) {
            throw new HttpException("There is no such receiver", HttpStatus.BAD_REQUEST);
        }

        const friendRequest = await this.friendRequestRepository.findOne({
            creator: creator,
            receiver: receiver
        }, {relations: ["creator", "receiver"]});
        if (!friendRequest) {
            throw new HttpException("There is no such friend request", HttpStatus.BAD_REQUEST);
        }

        return friendRequest;
    }

    async responseToFriendRequest(
        statusResponse: FriendRequestStatusType,
        friendRequestId: number,
        userId: number
    ): Promise<FriendRequestEntity> {
        const friendRequest = await this.friendRequestRepository.findOne(friendRequestId, { relations: ["creator", "receiver"] });

        if (!friendRequest) {
            throw new HttpException("There is no such friend request", HttpStatus.BAD_REQUEST);
        }

        if (friendRequest.status != FriendRequestStatus.Pending) {
            throw new HttpException("Friend request status was already changed", HttpStatus.BAD_REQUEST);
        }

        if (friendRequest.receiver.id != userId) {
            throw new HttpException("Current user isn't friend request receiver", HttpStatus.BAD_REQUEST);
        }

        friendRequest.status = statusResponse;

        return await this.friendRequestRepository.save(friendRequest);
    }

    async getCurrentUserReceivedFriendRequests(currentUserId: number): Promise<FriendRequestsInterface> {
        const user = await this.profileService.getCurrentUserWithProfile(currentUserId);

        const friendRequests = await this.friendRequestRepository.find({
            relations: ["creator", "receiver"],
            where: [
                { receiver: user, status: FriendRequestStatus.Pending }
            ]
        });

        const counter = friendRequests.length;

        const friendRequestResponse = friendRequests.map(req => this.buildFriendRequestResponse(req));

        return {
            requests: friendRequestResponse,
            requestsCounter: counter
        }
    }

    async getCurrentUserFriends(currentUserId: number) {
        const user = await this.profileService.getCurrentUserWithProfile(currentUserId);

        const friendRequests = await this.friendRequestRepository.find({
            relations: ["creator", "receiver"],
            where: [
                { receiver: user, status: FriendRequestStatus.Accepted },
                { creator: user, status: FriendRequestStatus.Accepted }
            ]
        });

        const counter = friendRequests.length;

        const friendRequestResponse = friendRequests.map(req => this.buildFriendRequestResponse(req));

        return {
            requests: friendRequestResponse,
            requestsCounter: counter
        }
    }

    buildFriendRequestResponse(friendRequest: FriendRequestEntity): FriendRequestInterface {
        return {
            request: {
                id: friendRequest.id,
                creator: friendRequest.creator.id,
                receiver: friendRequest.receiver.id,
                status: friendRequest.status
            }
        }
    }
}