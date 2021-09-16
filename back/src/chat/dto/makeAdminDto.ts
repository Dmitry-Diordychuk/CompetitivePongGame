import {IsNotEmpty, IsNumber} from "class-validator";

export class MakeAdminDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number

    @IsNotEmpty()
    @IsNumber()
    channelId: number
}