import {IsNotEmpty} from "class-validator";

export class ChannelHandleDto {
    @IsNotEmpty()
    readonly name: string;

    readonly password: string;
}