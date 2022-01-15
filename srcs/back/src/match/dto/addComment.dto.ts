import {IsNotEmpty, IsNumber, IsPositive, IsString, Length} from "class-validator";

export class AddCommentDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    matchId: number

    @IsString()
    @Length(1, 2000)
    message: string
}