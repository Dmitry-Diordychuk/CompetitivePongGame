import {IoAdapter} from "@nestjs/platform-socket.io";
import {ChatService} from "@app/chat/chat.service";
import {INestApplicationContext} from "@nestjs/common";

export class AuthenticatedSocketAdapter extends IoAdapter {
    private readonly chatService: ChatService;

    constructor(private app: INestApplicationContext) {
        super(app);
        this.chatService = this.app.get(ChatService);
    }

    private static getToken(request: any): string {
        const auth_field = request.headers.authorization;

        if (!auth_field) {
            return null;
        }

        return auth_field.split(' ')[1];
    }

    createIOServer(port: number, options?: any): any {
        options.allowRequest = async (request, allowFunction) => {
            const token = AuthenticatedSocketAdapter.getToken(request);

            if (!token) {
                return allowFunction('Unauthorized', false);
            }

            const user = await this.chatService.getUserFromToken(token);

            if (!user) {
                return allowFunction('Unauthorized', false);
            }

            request.headers.user = user;

            return allowFunction(null, true);
        }

        return super.createIOServer(port, options);
    }
}