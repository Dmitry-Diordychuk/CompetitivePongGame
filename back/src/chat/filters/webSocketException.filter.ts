import {BaseWsExceptionFilter, WsException} from "@nestjs/websockets";
import {ArgumentsHost, BadRequestException} from "@nestjs/common"

export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        if (exception instanceof BadRequestException) {
            const errors = exception["response"]["message"];
            exception = new WsException({errors});
        } else if (!(exception instanceof WsException)) {
            exception = new WsException("Unknown exception type");
        }
        super.catch(exception, host);
    }
}