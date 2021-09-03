import {IsNotEmpty} from "class-validator";

export class JoinChannelDto {
    @IsNotEmpty()
    readonly name: string;

    readonly password: string;
}