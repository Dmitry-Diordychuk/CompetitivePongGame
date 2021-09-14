import {IsNotEmpty, Matches} from "class-validator";
import {FriendRequestStatusType} from "@app/friend/types/friendRequestStatus.type";

export class FriendRequestChangeStatusDto {
    @IsNotEmpty()
    @Matches('((\\baccepted\\b)|(\\bdeclined\\b))')
    status: FriendRequestStatusType;
}