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
import {Logger, UseFilters, UsePipes} from "@nestjs/common";
import {RoomHandleDto} from "@app/chat/dto/roomHandle.dto";
import {ReceiveMessageDto} from "@app/chat/dto/receiveMessage.dto";
import {WebSocketExceptionFilter} from "@app/chat/filters/webSocketException.filter";
import {WebSocketValidationPipe} from "@app/shared/pipes/WebSocketValidation.pipe";

@UseFilters(new WebSocketExceptionFilter())
@WebSocketGateway(3002)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) {}

    private  logger: Logger = new Logger('ChatGateway');

    afterInit(server: any): any {
        this.logger.log('Chat Initialized');
        const general = this.chatService.createGeneralRoom();
        if (!general)
            throw new WsException("Unexpected error during general room creation");
    }

    async handleConnection(@ConnectedSocket() socket: Socket) {
    }

    handleDisconnect(client: any): any {
    }

    @UsePipes(new WebSocketValidationPipe())
    @SubscribeMessage('send_message')
    async listenForMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody() receiveMessageDto: ReceiveMessageDto
    ) {
        const token = this.chatService.getToken(socket);
        const user = await this.chatService.getUserFromToken(token);
        this.server.to(receiveMessageDto.room_name).emit('receive_message', {
            token,
            username: user.username,
            message: receiveMessageDto.message
        })
    }

    @UsePipes(new WebSocketValidationPipe())
    @SubscribeMessage('join_room')
    async handleJoinRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() roomHandleDto: RoomHandleDto
    )
    {
        let room = await this.chatService.findRoomByName(roomHandleDto.name);

        if (!room) {
            room = await this.chatService.createRoom(roomHandleDto);
        }

        if (await this.chatService.tryRoomPassword(room, roomHandleDto.password)) {
            socket.join(room.name);
            socket.emit('joined_room', room.name);
        } else {
            throw new WsException("Wrong password!");
        }
    }

    @UsePipes(new WebSocketValidationPipe())
    @SubscribeMessage('leave_room')
    async handleLeaveRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() roomHandleDto: RoomHandleDto
    )
    {
        socket.leave(roomHandleDto.name);
        socket.emit('left_room', roomHandleDto.name)
    }
}