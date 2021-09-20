import {IsAlpha, IsNotEmpty, IsOptional, IsString, Length} from "class-validator";

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    @IsAlpha()
    @Length(1, 1000)
    readonly name: string;

    @IsOptional()
    @IsString()
    @Length(6, 100)
    readonly password: string;
}