import {IsNotEmpty, IsString} from "class-validator";

export class JoinChannelDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsString()
    readonly password: string;
}