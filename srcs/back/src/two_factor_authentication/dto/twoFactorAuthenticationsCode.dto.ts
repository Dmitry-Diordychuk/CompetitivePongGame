import {IsString, Length, Matches} from "class-validator";

export class TwoFactorAuthenticationsCodeDto {
    @IsString()
    @Matches(/[0-9][0-9][0-9][0-9][0-9][0-9]/)
    @Length(6,6)
    code: string
}