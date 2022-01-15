import {IsNotEmpty, IsNumber} from "class-validator";

export class IsUserOnlineDto {
    @IsNotEmpty()
    @IsNumber()
    readonly userId: string;
}