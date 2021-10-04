import {IsNotEmpty, IsString} from "class-validator";

export class PrivateMessageDto {
    @IsNotEmpty()
    @IsString()
    to: string

    @IsNotEmpty()
    @IsString()
    message: string
}