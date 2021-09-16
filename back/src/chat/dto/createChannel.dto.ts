import {IsNotEmpty, IsString} from "class-validator";

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    readonly password: string;
}