import {IsNotEmpty} from "class-validator";

export class ReceiveMessageDto {
    @IsNotEmpty()
    readonly room_name: string

    @IsNotEmpty()
    readonly message: string
}