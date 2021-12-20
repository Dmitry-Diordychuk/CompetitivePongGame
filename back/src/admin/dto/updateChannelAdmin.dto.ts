import {IsNotEmpty, IsNumber, IsPositive} from "class-validator";

export class UpdateChannelAdminDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    channelId: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    userId: number;
}