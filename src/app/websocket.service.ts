import { Injectable, EventEmitter } from '@angular/core';

/**
 * Service used to create and connect to web sockets, it utilizes Subject and Observables from rxjs
 * send and receive data
 */
@Injectable({
    providedIn: 'root'
})
export class WebsocketService {

    private socket: WebSocket;
    private listener: EventEmitter<any> = new EventEmitter();

    public constructor() {}

    /**
     * Create new socket connection
     */
    connect(socketURL: string) {
        if (this.socket != null && this.socket.readyState === this.socket.OPEN) {
            console.error('CONNECT: Socket is already open');
        } else {
            console.log(`New socket connection to ${socketURL}`);
            this.socket = new WebSocket(socketURL);
            this.socket.onopen = event => {
                this.listener.emit({ 'type': 'open', 'data': event });
            };
            this.socket.onclose = event => {
                this.listener.emit({ 'type': 'close', 'data': event });
            };
            this.socket.onmessage = event => {
                this.listener.emit({ 'type': 'message', 'data': event.data });
            };
        }
    }

    /**
     * Send data to socket
     */
    send(data: string) {
        if (this.socket != null && this.socket.readyState === this.socket.OPEN) {
            this.socket.send(data);
        } else {
            console.error('SEND: Socket is not open!');
        }
    }
    /**
     * Close socket
     */
    close() {
        if (this.socket != null && this.socket.readyState === this.socket.OPEN) {
            this.socket.close();
            this.socket = null;
        } else {
            console.error('CLOSE: Socket is not open!');
        }
    }
    /**
     * Socket event listeners
     */
    getEventListener() {
        return this.listener;
    }
}
