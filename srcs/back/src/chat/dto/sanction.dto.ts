import {IsDateString, IsIn, IsNotEmpty, IsNumber, IsString, Matches} from "class-validator";

export class SanctionDto {
    @IsNotEmpty()
    @IsString()
    @Matches('(?!^\\d+$)^.+$')
    channel: string

    @IsNotEmpty()
    @IsNumber()
    userId: number

    @IsNotEmpty()
    @IsIn(["ban", "mute"])
    type: string

    @IsNotEmpty()
    @IsDateString()
    expiryAt: string;
}