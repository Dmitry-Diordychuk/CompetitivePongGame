import {IsNotEmpty, IsString, Length} from "class-validator";

export class ReceiveMessageDto {
    @IsNotEmpty()
    @IsString()
    @Length(1, 1000)
    readonly channel: string

    @IsNotEmpty()
    @IsString()
    readonly message: string
}