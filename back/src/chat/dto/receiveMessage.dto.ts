import {IsAlpha, IsNotEmpty, IsString, Length} from "class-validator";

export class ReceiveMessageDto {
    @IsNotEmpty()
    @IsString()
    //TODO: регулярное выражение
    //@IsAlpha()
    @Length(1, 1000)
    readonly channel: string

    @IsNotEmpty()
    @IsString()
    readonly message: string
}