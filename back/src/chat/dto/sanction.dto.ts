import {IsAlpha, IsDateString, IsIn, IsNotEmpty, IsNumber, IsString} from "class-validator";

export class SanctionDto {
    @IsNotEmpty()
    @IsString()
    //@IsAlpha()
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