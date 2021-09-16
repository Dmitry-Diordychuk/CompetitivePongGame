import {IsNotEmpty, IsOptional, IsString, Length} from "class-validator";

export class UpdateChannelDto {
    @IsNotEmpty()
    @IsString()
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
