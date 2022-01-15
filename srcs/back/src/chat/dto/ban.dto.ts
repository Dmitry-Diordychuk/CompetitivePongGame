import {IsNotEmpty, IsNumber} from "class-validator";

export class banDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number
}