import React, {useEffect, useRef, useState} from "react";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useChat} from "../contexts/chat.context";
import Matchmacking from "./Matchmacking";

import '../styles/TopPanel.css'
import {useSocketIO} from "../contexts/socket.io.context";


export default function TopPanel() {
    const chat = useChat();
    const auth = useAuth();
    const socket = useSocketIO();
    const navigate = useNavigate();

    useEffect(()=>{}, [chat.currentChannelName])

    return (
        <div>
            <div className="topnav">
                {
                    auth.user && (auth.user.role === 'Admin' || auth.user.role === 'Owner')
                        ?
                        <Link style={{ textDecoration: 'none' }} to="/admin">Admin</Link>
                        :
                        <></>
                }
                <Link to="/">Pong</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/channels">Channels</Link>
                <Link to="/contacts">Contacts</Link>
                <Link to="/settings">Settigs</Link>
                <Matchmacking />

                {auth.user ?
                    <a className={'right'} onClick={() => {
                        auth.signout(() => {
                            socket.disconnect();
                            navigate("/");
                        });
                    }}>Sign out</a>
                        : <></>
                }
                {auth.user ? <a className={'right'}>Welcome {auth.user.username}!</a> : 0}
                <a className={'right'}>{"Current channel: " + chat.currentChannelName}</a>
            </div>
            <Outlet />
        </div>
    )
}

