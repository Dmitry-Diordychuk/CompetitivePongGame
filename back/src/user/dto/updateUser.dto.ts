import {IsOptional, IsString, Length} from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Length(1, 1000)
    username: string

    @IsOptional()
    @IsString()
    @Length(1, 1000)
    image: string
}