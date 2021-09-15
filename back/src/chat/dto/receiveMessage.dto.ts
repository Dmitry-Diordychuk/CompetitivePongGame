import {IsNotEmpty, IsString} from "class-validator";

export class ReceiveMessageDto {
    @IsNotEmpty()
    @IsString()
    readonly channel: string

    @IsNotEmpty()
    @IsString()
    readonly message: string
}