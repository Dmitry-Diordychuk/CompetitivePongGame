import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer, WsException
} from "@nestjs/websockets";
import {Server, Socket} from 'socket.io'
import {ChatService} from "@app/chat/chat.service";
import {Logger, UseFilters, UseGuards} from "@nestjs/common";
import {RoomHandleDto} from "@app/chat/dto/roomHandle.dto";
import {ReceiveMessageDto} from "@app/chat/dto/receiveMessage.dto";

@WebSocketGateway(3002)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) {}

    private  logger: Logger = new Logger('ChatGateway');

    afterInit(server: any): any {
        this.logger.log('Chat Initialized')
    }

    async handleConnection(@ConnectedSocket() socket: Socket) {
    }

    handleDisconnect(client: any): any {
    }

    @SubscribeMessage('send_message')
    async listenForMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() receiveMessageDto: ReceiveMessageDto
    ) {
        throw new WsException("Test");
        // const token = this.chatService.getToken(socket);
        // const user = await this.chatService.getUserFromToken(token);
        // this.server.to(receiveMessageDto.room).emit('receive_message', {
        //     token,
        //     username: user.username,
        //     message: receiveMessageDto.message
        // })
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() messageDto: RoomHandleDto
    )
    {
        socket.join(messageDto.room);
        socket.emit('joined_room', messageDto.room)
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() messageDto: RoomHandleDto
    )
    {
        socket.leave(messageDto.room);
        socket.emit('left_room', messageDto.room)
    }
}