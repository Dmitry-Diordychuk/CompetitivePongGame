import {IsDateString, IsIn, IsNotEmpty, IsNumber} from "class-validator";

export class SanctionDto {
    @IsNotEmpty()
    @IsNumber()
    channelId: number

    @IsNotEmpty()
    @IsNumber()
    userId: number

    @IsNotEmpty()
    @IsIn(["ban", "mute"])
    type: string

    @IsNotEmpty()
    @IsDateString()
    expiryAt: Date;
}