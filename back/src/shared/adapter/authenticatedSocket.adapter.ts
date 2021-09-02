import {IoAdapter} from "@nestjs/platform-socket.io";
import {ChatService} from "@app/chat/chat.service";
import {INestApplicationContext} from "@nestjs/common";

export class AuthenticatedSocketAdapter extends IoAdapter {
    private readonly chatService: ChatService;

    constructor(private app: INestApplicationContext) {
        super(app);
        this.chatService = this.app.get(ChatService);
    }

    private getToken(request: any): string {
        const auth_field = request.headers.authorization;

        if (!auth_field) {
            return null;
        }

        const token = auth_field.split(' ')[1];
        return token;
    }

    createIOServer(port: number, options?: any): any {
        options.allowRequest = async (request, allowFunction) => {
            const token = this.getToken(request);

            if (!token) {
                console.log("ERROR: Unauthorized connection!")
                return allowFunction('Unauthorized', false);
            }

            const user = await this.chatService.getUserFromToken(token);

            if (!user) {
                return allowFunction('Unauthorized', false);
            }

            return allowFunction(null, true);
        }
        return super.createIOServer(port, options);
    }
}