import {ProfileEntity} from "@app/profile/profile.entity";

export class ProfileResponseInterface {
    profile: {username: string} & ProfileEntity
}