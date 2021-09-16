import {IsNotEmpty, IsString} from "class-validator";

export class JoinChannelDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    readonly password: string;
}