import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import * as cookie from "cookie";

@Injectable()
@WebSocketGateway({
    cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
    },
    transports: ["websocket", "polling"],
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private onlineUsers = new Map<string, Set<string>>(); // userId -> socketId

    constructor(private jwtService: JwtService) { }

    handleConnection(client: Socket) {
        try {
            const cookies = cookie.parse(client.handshake.headers.cookie || "");
            const token = cookies["accessToken"];
            if (!token) return client.disconnect();

            const payload = this.jwtService.verify(token);
            const userId = payload.sub;

            const isFirstConnection = !this.onlineUsers.has(userId);

            if (isFirstConnection) {
                this.onlineUsers.set(userId, new Set());
            }

            this.onlineUsers.get(userId).add(client.id);

            client.emit("online_users", [...this.onlineUsers.keys()]);

            if (isFirstConnection) {
                this.broadcastStatus(userId, true);
            }

            console.log(`User ${userId} connected (${client.id})`);
        } catch (err) {
            console.log("Socket auth failed:", err.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        for (const [userId, socketSet] of this.onlineUsers.entries()) {
            if (socketSet.has(client.id)) {
                socketSet.delete(client.id);

                if (socketSet.size === 0) {
                    this.onlineUsers.delete(userId);
                    this.broadcastStatus(userId, false);
                    console.log(`User ${userId} fully disconnected`);
                }
                break;
            }
        }
    }

    private broadcastStatus(userId: string, isOnline: boolean) {
        this.server.emit("update_status", { userId, isOnline });
    }

    // Gửi lời mời kết bạn
    @SubscribeMessage("friend:send")
    async handleFriendSend(
        @MessageBody() data: { from: string; to: string }
    ) {
        const { from, to } = data;
        const sockets = this.onlineUsers.get(to);
        if (sockets) {
            sockets.forEach((socketId) => {
                this.server.to(socketId).emit("friend:received", { from });
            });
        }
    }

    // Khi chấp nhận lời mời
    @SubscribeMessage("friend:accept")
    async handleFriendAccept(
        @MessageBody() data: { from: string; to: string }
    ) {
        const { from, to } = data;
        const sockets = this.onlineUsers.get(to);
        if (sockets) {
            sockets.forEach((socketId) => {
                this.server.to(socketId).emit("friend:acceptedByFriend", { from });
            });
        }
    }
}
