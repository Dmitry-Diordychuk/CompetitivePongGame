import {FriendRequestInterface} from "@app/friend/types/friendRequest.interface";

export interface FriendRequestsInterface {
    requests: FriendRequestInterface[];
    requestsCounter: number;
}