import {IsNotEmpty} from "class-validator";

export class RoomHandleDto {
    @IsNotEmpty()
    readonly name: string;

    readonly password: string;
}