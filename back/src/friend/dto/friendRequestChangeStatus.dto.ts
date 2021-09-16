import {IsIn, IsNotEmpty} from "class-validator";
import {FriendRequestStatusType} from "@app/friend/types/friendRequestStatus.type";

export class FriendRequestChangeStatusDto {
    @IsNotEmpty()
    @IsIn(["accepted", "declined"])
    status: FriendRequestStatusType;
}