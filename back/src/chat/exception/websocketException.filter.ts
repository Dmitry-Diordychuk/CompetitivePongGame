import {BaseWsExceptionFilter} from "@nestjs/websockets";
import {ArgumentsHost} from "@nestjs/common";
import {response} from "express";

export class WebsocketExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        super.catch(exception, host);
    }
}