import {IsNotEmpty, IsNumber, IsPositive, IsString} from "class-validator";

export class UpdateChannelAdminDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    channelId: number;

    @IsString()
    userName: string;
}