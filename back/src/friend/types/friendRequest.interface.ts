import {FriendRequestStatusType} from "@app/friend/types/friendRequestStatus.type";

export interface FriendRequestInterface {
    id: number;
    creator: number;
    receiver: number;
    status: FriendRequestStatusType;
}