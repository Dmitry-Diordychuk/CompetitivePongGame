import {io, Socket} from "socket.io-client/build/esm-debug";
import React, {useRef} from "react";
import {useEffectOnce} from "usehooks-ts";
import {API_URL, SOCKET_IO_PORT} from "../config";


interface SocketIOContextType {
    socket: Socket | null;
    connect: Function;
    disconnect: VoidFunction;
    isConnected: Function;
    on: Function;
    emit: Function;
    once: Function;
    off: Function;
}

const SocketIOContext = React.createContext<SocketIOContextType>(null!);

export function SocketIOProvider({ children }: { children: React.ReactNode }) {
    const socketRef = useRef(io(`${API_URL}:${SOCKET_IO_PORT}`, {
        autoConnect: false,
    }));

    useEffectOnce(() => {
        socketRef.current.on('exception', (response: any) => {
        });
        return (() => {
           socketRef.current.off('exception');
        });
    })

    const connect = (userToken: string) => {
        if (socketRef.current.disconnected) {
            socketRef.current.io.opts.extraHeaders = {
                Authorization: "Bearer " + userToken,
            }
            socketRef.current.once("connect_error", (err) => {
            });
            socketRef.current.connect();
        }
    }
    
    const disconnect = () => {
        socketRef.current.disconnect();
    }

    const isConnected = () => {
        return socketRef.current.connected;
    }

    const on = (event: string, callback: VoidFunction) => {
        socketRef.current.on(event, callback);
    }

    const emit = (ev: string, data: any) => {
        socketRef.current.emit(ev, data);
    }

    const once = (ev: string, data: any) => {
        socketRef.current.once(ev, data);
    }

    const off = (ev: string, callback: any) => {
        socketRef.current.off(ev, callback);
    }

    let value : SocketIOContextType = {
        socket: socketRef.current,
        connect,
        disconnect,
        isConnected,
        on,
        emit,
        once,
        off,
    };

    return <SocketIOContext.Provider value={value}>{children}</SocketIOContext.Provider>;
}

export function useSocketIO() {
    return React.useContext(SocketIOContext);
}