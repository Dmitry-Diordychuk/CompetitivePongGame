import {IsOptional, IsString, Length} from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Length(6, 100)
    username: string

    @IsOptional()
    @IsString()
    @Length(6, 1000)
    image: string
}