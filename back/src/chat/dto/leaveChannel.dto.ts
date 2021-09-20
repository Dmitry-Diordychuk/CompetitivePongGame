import {IsAlpha, IsNotEmpty, IsString, Length} from "class-validator";

export class LeaveChannelDto {
    @IsNotEmpty()
    @IsString()
    @IsAlpha()
    @Length(1, 1000)
    readonly name: string;
}