import {Controller, Get, Param, Post, Query, Redirect} from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {UsersService} from "@app/users/users.service";
import {APP_SECRET, APP_UID} from "@app/config";
import {Observable} from "rxjs";
import {AxiosResponse} from "axios";

@Controller("api")
export class UsersController {
    /*@Get("users")
    async get_chatuser*/

    // @Get("users")
    // async register(@Query('code') code: string): Promise<any> {
    //     let result: Observable<AxiosResponse>;
    //     try {
    //         result = await this.httpService.post('https://api.intra.42.fr/oauth/token', {
    //             grant_type: 'authorization_code',
    //             client_id: APP_UID,
    //             client_secret: APP_SECRET,
    //             code: code,
    //             redirect_uri: encodeURIComponent('http://localhost:3001/api/users/')
    //         });
    //     }
    //     catch (exception) {
    //         return exception as any;
    //     }
    //     return result as any;
    // }

    // @Get("users/test")
    // getToken(@Query('token') token: string): string {
    //     return token;
    // }

    // @Post("users")
    // register(): string {
    //     return this.userService.register();
    // }
}
