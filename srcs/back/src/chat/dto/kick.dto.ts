import {IsNotEmpty, IsNumber, IsString, Matches} from "class-validator";

export class KickDto {
    @IsNotEmpty()
    @IsString()
    @Matches('(?!^\\d+$)^.+$')
    channel: string

    @IsNotEmpty()
    @IsNumber()
    userId: number
}