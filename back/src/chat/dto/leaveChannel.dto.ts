import {IsNotEmpty} from "class-validator";

export class LeaveChannelDto {
    @IsNotEmpty()
    readonly name: string;
}