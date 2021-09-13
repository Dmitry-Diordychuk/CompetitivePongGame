import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ProfileEntity} from "@app/profile/profile.entity";
import {FriendRequestStatusType} from "@app/friend/types/friendRequestStatus.type";

@Entity('friend_requests')
export class FriendRequestEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(
        () => ProfileEntity,
        (profileEntity) => profileEntity.sentFriendRequests,
        {nullable: false}
    )
    creator: ProfileEntity;

    @ManyToOne(
        () => ProfileEntity,
        (profileEntity) => profileEntity.receivedFriendRequests,
        {nullable: false}
    )
    receiver: ProfileEntity;

    @Column({nullable: false})
    status: FriendRequestStatusType;
}