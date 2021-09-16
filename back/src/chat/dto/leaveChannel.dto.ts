import {IsNotEmpty, IsString, Length} from "class-validator";

export class LeaveChannelDto {
    @IsNotEmpty()
    @IsString()
    @Length(1, 1000)
    readonly name: string;
}