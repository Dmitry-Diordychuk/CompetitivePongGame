import {UserEntity} from "@app/user/user.entity";

export interface UserResponseInterface {
    user: UserEntity & {token: string};
}