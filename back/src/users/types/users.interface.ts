import {UsersEntity} from "@app/users/users.entity";

export interface UserResponseInterface {
    user: UsersEntity & {token: string};
}