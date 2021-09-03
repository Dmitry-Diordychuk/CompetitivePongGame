import {ArgumentMetadata, PipeTransform} from "@nestjs/common";
import {plainToClass} from "class-transformer";
import {validate, ValidationError} from "class-validator";
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {ChannelHandleDto} from "@app/chat/dto/channelHandle.dto";
import {ReceiveMessageDto} from "@app/chat/dto/receiveMessage.dto";


export class WebSocketValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        if (typeof value == "string") {
            throw new WsException("JSON was expected not text");
        }

        if (value instanceof Socket) {
            return value;
        } else if (value instanceof ChannelHandleDto || ReceiveMessageDto) {
            const object = plainToClass(metadata.metatype, value);

            const errors: ValidationError[] = await validate(object);

            if (errors.length === 0) {
                return value;
            }

            throw new WsException({errors: this.formatError(errors)});
        }
        throw new WsException("Wrong message format!");
    }

    formatError(errors: ValidationError[]) {
        return errors.reduce((acc, err) => {
            acc[err.property] = Object.values(err.constraints);
            return acc;
        }, {});
    }

}