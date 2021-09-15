import {IsNotEmpty, IsString} from "class-validator";

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsString()
    readonly password: string;
}