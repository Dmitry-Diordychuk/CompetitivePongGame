import {BaseWsExceptionFilter} from "@nestjs/websockets";
import {ArgumentsHost} from "@nestjs/common"

export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        super.catch(exception, host);
    }
}