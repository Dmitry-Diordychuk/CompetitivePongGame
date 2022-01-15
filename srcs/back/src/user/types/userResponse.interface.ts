import {UserType} from "@app/user/types/user.type";

export interface UserResponseInterface {
    user: UserType & {image:string} & {token:string}
}