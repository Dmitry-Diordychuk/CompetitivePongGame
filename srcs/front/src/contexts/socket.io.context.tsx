import {io, Socket} from "socket.io-client/build/esm-debug";
import { useAuth } from "../auth/auth.context";
import React, {useRef, useEffect} from "react";
import {useEffectOnce} from "usehooks-ts";
import {useNavigate} from "react-router-dom";

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
    const auth = useAuth();
    const navigate = useNavigate();

    const socketRef = useRef(io("http://localhost:3002", {
        autoConnect: false,
    }));

    useEffect(() => {
        if (auth.user) {
            connect(auth.user.token);
        } else {
            disconnect();
        }
    }, [auth.user]);

    useEffect(() => {
        on('disconnect', ()=>{
            navigate('/logout', {replace: true});
        })
        return (()=> {
            socketRef.current.off('disconnect');
        })
    },[auth.user]);

    useEffect(() => {
        on('ban', ()=>{
            navigate('/logout', {replace: true});
        })
        return (()=> {
            socketRef.current.off('ban');
        })
    }, [auth.user]);

    useEffectOnce(() => {
        socketRef.current.on('exception', (response: any) => {
            console.log(response);
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
                console.log(`connect_error due to ${err.message}`);
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