export enum FriendRequestStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Decline = 'declined'
}

export type FriendRequestStatusType = FriendRequestStatus.Pending | FriendRequestStatus.Accepted | FriendRequestStatus.Decline;