import {BaseWsExceptionFilter, WsException} from "@nestjs/websockets";
import {ArgumentsHost, BadRequestException} from "@nestjs/common"
import {QueryFailedError} from "typeorm";

export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        if (exception instanceof BadRequestException) {
            const errors = exception["response"]["message"];
            exception = new WsException({errors});
        } else if (exception instanceof QueryFailedError) {
            console.log(exception);
            exception = new WsException("Database query exception");
        } else if (!(exception instanceof WsException)) {
            console.log(exception);
            exception = new WsException("Unknown exception type");
        }
        super.catch(exception, host);
    }
}