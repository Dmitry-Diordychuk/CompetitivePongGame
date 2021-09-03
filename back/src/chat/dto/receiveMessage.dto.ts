import {IsNotEmpty} from "class-validator";

export class ReceiveMessageDto {
    @IsNotEmpty()
    readonly channel: string

    @IsNotEmpty()
    readonly message: string
}