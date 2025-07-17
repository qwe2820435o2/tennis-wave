import * as signalR from '@microsoft/signalr';
import { store } from '../store';
import { addMessage, updateUnreadCount, removeTempMessage } from '../store/slices/chatSlice';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private isConnecting = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private readyPromise: Promise<void> | null = null;
    private readyResolve: (() => void) | null = null;
    private readyReject: ((error: any) => void) | null = null;

    async startConnection(): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            console.log('SignalR already connected');
            return;
        }

        if (this.isConnecting) {
            console.log('SignalR connection already in progress');
            return;
        }

        this.isConnecting = true;
        this.readyPromise = new Promise<void>((resolve, reject) => {
            this.readyResolve = resolve;
            this.readyReject = reject;
        });

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token available for SignalR connection');
            }

            console.log('Creating SignalR connection...');
            const baseUrl = 'https://tennis-wave-api-production.up.railway.app'; // Use Public Networking
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${baseUrl}/chatHub?access_token=${token}`, {
                    withCredentials: true
                })
                .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Set up event handlers
            this.setupEventHandlers();

            // Start connection
            console.log('Starting SignalR connection...');
            await this.connection.start();
            
            this.readyResolve?.();
            console.log('SignalR connection established successfully');
            console.log('Connection state:', this.connection.state);
            console.log('Connection ID:', this.connection.connectionId);
            this.reconnectAttempts = 0;
            this.isConnecting = false;

        } catch (error) {
            console.error('Failed to start SignalR connection:', error);
            this.isConnecting = false;
            this.readyReject?.(error);
            this.handleReconnection();
        }
    }

    private setupEventHandlers(): void {
        if (!this.connection) return;

        // Handle incoming messages
        this.connection.on('ReceiveMessage', (message) => {
            console.log('Received message via SignalR:', message);
            console.log('Dispatching addMessage for conversationId:', message.conversationId);
            // Remove temp message with same content
            store.dispatch(removeTempMessage({
                conversationId: message.conversationId,
                content: message.content
            }));
            store.dispatch(addMessage({
                conversationId: message.conversationId,
                message: message
            }));
            
            // Update unread count for other conversations
            store.dispatch(updateUnreadCount({
                conversationId: message.conversationId,
                count: 1
            }));
        });

        // Handle read receipts
        this.connection.on('MessagesRead', (conversationId: string, userId: string) => {
            console.log(`Messages read in conversation ${conversationId} by user ${userId}`);
            // You can implement read receipt UI updates here
        });

        // Handle connection events
        this.connection.onclose((error) => {
            console.log('SignalR connection closed:', error);
            this.isConnecting = false;
            this.handleReconnection();
        });

        this.connection.onreconnecting((error) => {
            console.log('SignalR reconnecting:', error);
            this.isConnecting = true;
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR reconnected with connection ID:', connectionId);
            this.reconnectAttempts = 0;
            this.isConnecting = false;
        });
    }

    private async handleReconnection(): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(async () => {
            try {
                await this.startConnection();
            } catch (error) {
                console.error('Reconnection failed:', error);
            }
        }, 2000 * this.reconnectAttempts);
    }

    async joinConversation(conversationId: string): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('JoinConversation', conversationId);
                console.log(`Joined conversation: ${conversationId}`);
            } catch (error) {
                console.error('Failed to join conversation:', error);
                throw error;
            }
        } else {
            console.warn('SignalR not connected, cannot join conversation');
        }
    }

    async leaveConversation(conversationId: string): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('LeaveConversation', conversationId);
                console.log(`Left conversation: ${conversationId}`);
            } catch (error) {
                console.error('Failed to leave conversation:', error);
            }
        }
    }

    async sendMessage(conversationId: string, content: string): Promise<void> {
        console.log('Attempting to send message via SignalR...');
        console.log('Connection state:', this.connection?.state);
        console.log('Is connected:', this.isConnected());
        
        if (!this.connection) {
            throw new Error('SignalR connection not initialized');
        }

        if (this.connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error(`SignalR connection not available. State: ${this.connection.state}`);
        }

        try {
            console.log(`Sending message to conversation ${conversationId}: ${content}`);
            await this.connection.invoke('SendMessage', conversationId, content);
            console.log('Message sent via SignalR successfully');
        } catch (error) {
            console.error('Failed to send message via SignalR:', error);
            throw error;
        }
    }

    async markAsRead(conversationId: string): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke('MarkAsRead', conversationId);
                console.log(`Marked conversation ${conversationId} as read`);
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
    }

    async stopConnection(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log('SignalR connection stopped');
            } catch (error) {
                console.error('Error stopping SignalR connection:', error);
            } finally {
                this.connection = null;
                this.isConnecting = false;
                this.readyPromise = null;
                this.readyResolve = null;
                this.readyReject = null;
            }
        }
    }

    getConnectionState(): signalR.HubConnectionState | null {
        return this.connection?.state || null;
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    async waitForReady(): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            return;
        }
        
        if (this.readyPromise) {
            await this.readyPromise;
        } else {
            throw new Error('SignalR connection not initialized');
        }
    }

    // Added: Check connection status and try to reconnect
    async ensureConnection(): Promise<void> {
        if (!this.isConnected()) {
            console.log('SignalR not connected, attempting to start connection...');
            await this.startConnection();
        }
    }
}

// Export singleton instance
export const signalRService = new SignalRService();
export default signalRService; 