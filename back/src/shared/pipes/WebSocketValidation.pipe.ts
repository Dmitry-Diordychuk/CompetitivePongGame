import {ArgumentMetadata, PipeTransform} from "@nestjs/common";
import {plainToClass} from "class-transformer";
import {validate} from "class-validator";
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";


export class WebSocketValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        if (!(value instanceof Socket)) {
            const object = plainToClass(metadata.metatype, value);

            const errors = await validate(object);

            if (errors.length === 0) {
                return value;
            }

            throw new WsException(errors.join(', '));
        }
        return value;
    }

}