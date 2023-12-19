import { WebSocketGateway, OnGatewayConnection, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection {
    @WebSocketServer()
    private socket: Socket;
    private server: Server;

    constructor(private readonly socketService: SocketService) { }

    handleConnection(socket: Socket): void {
        this.socketService.handleConnection(socket);
    }

    // streamData socket implementation

    @SubscribeMessage('streamData')
    handleStreamData(@MessageBody() data: any): void {
        this.socket.emit('streamData', data);
    }

    // WebRTC socket implementation

    @SubscribeMessage('offer')
    handleOffer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
        const targetClient = this.socketService.getConnectedClient(data.target);
        if (targetClient) {
            targetClient.emit('offer', { sdp: data.sdp, sender: client.id });
        }
    }

    @SubscribeMessage('answer')
    handleAnswer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
        const targetClient = this.socketService.getConnectedClient(data.target);
        if (targetClient) {
            targetClient.emit('answer', { sdp: data.sdp, sender: client.id });
        }
    }

    @SubscribeMessage('iceCandidate')
    handleIceCandidate(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
        const targetClient = this.socketService.getConnectedClient(data.target);
        if (targetClient) {
            targetClient.emit('iceCandidate', { candidate: data.candidate, sender: client.id });
        }
    }
}