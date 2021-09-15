import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class PrivateMessageDto {
    @IsNotEmpty()
    @IsNumber()
    to: number

    @IsNotEmpty()
    @IsString()
    message: string
}