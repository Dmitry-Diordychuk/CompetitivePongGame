import {UserType} from "@app/user/types/user.type";

export interface UsersResponseInterface {
    users: UserType[];
    counter: number;
}