import {IsNotEmpty, IsOptional, IsString, Length, Matches} from "class-validator";

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    @Matches('(?!^\\d+$)^.+$')
    @Length(1, 1000)
    readonly name: string;

    @IsOptional()
    @IsString()
    @Length(6, 100)
    readonly password: string;
}