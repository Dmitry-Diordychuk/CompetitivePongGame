import {Controller, Get, Param} from '@nestjs/common';
import {ChatService} from "@app/chat/chat.service";

@Controller("api/chat")
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) {}

    @Get('user:id')
    async getUserById(@Param('id') id: number) {
        console.log(id);
        return "HELLO";
    }
}
