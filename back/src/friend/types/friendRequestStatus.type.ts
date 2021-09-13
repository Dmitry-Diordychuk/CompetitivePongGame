export enum FriendRequestStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Decline = 'decline'
}

export type FriendRequestStatusType = FriendRequestStatus.Pending | FriendRequestStatus.Accepted | FriendRequestStatus.Decline;