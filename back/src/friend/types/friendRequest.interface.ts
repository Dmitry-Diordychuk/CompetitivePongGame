import {FriendRequestStatusType} from "@app/friend/types/friendRequestStatus.type";

export interface FriendRequestInterface {
    request: {
        id: number;
        creator: number;
        receiver: number;
        status: FriendRequestStatusType;
    }
}