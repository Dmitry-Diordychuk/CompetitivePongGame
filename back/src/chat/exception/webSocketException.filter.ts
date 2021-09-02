import {BaseWsExceptionFilter, WsException} from "@nestjs/websockets";
import {ArgumentsHost, BadRequestException} from "@nestjs/common";

export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        if (exception instanceof BadRequestException) {
            exception = new WsException(Object.values(exception.getResponse())[1].join(', '));
        }
        super.catch(exception, host);
    }
}