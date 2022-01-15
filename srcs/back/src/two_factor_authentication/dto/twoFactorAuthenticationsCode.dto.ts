import {IsString, Length} from "class-validator";

export class TwoFactorAuthenticationsCodeDto {
    @IsString()
    @Length(6,6)
    code: string
}