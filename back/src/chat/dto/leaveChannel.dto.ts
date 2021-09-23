import {IsNotEmpty, IsString, Length, Matches} from "class-validator";

export class LeaveChannelDto {
    @IsNotEmpty()
    @IsString()
    @Matches('(?!^\\d+$)^.+$')
    @Length(1, 1000)
    readonly name: string;
}