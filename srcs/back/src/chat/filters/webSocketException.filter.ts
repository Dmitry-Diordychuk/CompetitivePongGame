import {BaseWsExceptionFilter, WsException} from "@nestjs/websockets";
import {ArgumentsHost, BadRequestException} from "@nestjs/common"
import {QueryFailedError} from "typeorm";

export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        if (exception instanceof BadRequestException) {
            const errors = exception["response"]["message"];
            exception = new WsException({errors});
        } else if (exception instanceof QueryFailedError) {
            exception = new WsException("Database query exception");
        } else if (!(exception instanceof WsException)) {
            exception = new WsException("Unknown exception type");
        } else {
            let errors;
            if (exception["error"]["errors"]) {
                errors = [exception["error"]["errors"]];
            } else {
                errors = [exception["error"]];
            }
            exception = new WsException({errors});
        }
        super.catch(exception, host);
    }
}