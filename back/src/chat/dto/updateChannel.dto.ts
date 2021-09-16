import {IsNotEmpty, IsString} from "class-validator";

export class UpdateChannelDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    readonly oldPassword: string;

    readonly newPassword: string;
}