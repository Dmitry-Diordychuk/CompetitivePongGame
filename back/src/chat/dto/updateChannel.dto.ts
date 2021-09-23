import {IsNotEmpty, IsOptional, IsString, Length, Matches} from "class-validator";

export class UpdateChannelDto {
    @IsNotEmpty()
    @IsString()
    @Matches('(?!^\\d+$)^.+$')
    @Length(1, 1000)
    readonly name: string;

    @IsOptional()
    @IsString()
    @Length(6, 100)
    readonly oldPassword: string;

    @IsString()
    @Length(6, 100)
    readonly newPassword: string;
}
