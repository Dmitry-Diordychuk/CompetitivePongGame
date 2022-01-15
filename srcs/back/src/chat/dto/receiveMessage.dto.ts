import {IsNotEmpty, IsString, Length, Matches} from "class-validator";

export class ReceiveMessageDto {
    @IsNotEmpty()
    @IsString()
    @Matches('(?!^\\d+$)^.+$')
    @Length(1, 1000)
    readonly channel: string

    @IsNotEmpty()
    @IsString()
    readonly message: string
}