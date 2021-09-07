import {UserEntity} from "@app/user/user.entity";

export type UserType = Omit<UserEntity, "ft_id" | "level" | "victories" | "losses">