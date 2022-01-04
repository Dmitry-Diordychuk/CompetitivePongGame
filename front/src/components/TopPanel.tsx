import React, {useEffect} from "react";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useChat} from "../contexts/chat.context";
import Matchmacking from "./Matchmacking";
import Duel from "./Duel";

import '../styles/TopPanel.css'
import {useSocketIO} from "../contexts/socket.io.context";


export default function TopPanel() {
    const chat = useChat();
    const auth = useAuth();
    const socket = useSocketIO();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(()=>{}, [chat.currentChannelName])

    return (
        <div>
            <div className="topnav">
                {
                    auth.user && (auth.user.role === 'Admin' || auth.user.role === 'PO')
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
                {location.pathname !== '/game' ? <Matchmacking/> : <></>}
                {location.pathname !== '/game' ? <Duel /> : <></>}

                {auth.user ?
                    <button className={'right'} onClick={() => {
                        auth.signout(() => {
                            socket.disconnect();
                            navigate("/");
                        });
                    }}>Sign out</button>
                        : <></>
                }
                {auth.user ? <button className={'right'}>Welcome {auth.user.username}!</button> : 0}
                <button className={'right'}>{"Current channel: " + chat.currentChannelName}</button>
            </div>
            <Outlet />
        </div>
    )
}

