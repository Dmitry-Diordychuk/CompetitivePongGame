import React, {useEffect, useRef, useState} from "react";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useChat} from "../contexts/chat.context";
import Matchmacking from "./Matchmacking";

import '../styles/TopPanel.css'


export default function TopPanel() {
    const chat = useChat();

    useEffect(()=>{}, [chat.currentChannelName])

    return (
        <div>
            <div className="topnav">
                <div className="topnav">
                    <Link to="/">Pong</Link>
                </div>
                <div className="topnav">
                    <AuthStatus />
                </div>
                <div className="topnav">
                    <Link to="/profile">Profile</Link>
                </div>
                <div className="topnav">
                    <Link to="/channels">Channels</Link>
                </div>
                <div className="topnav">
                    {chat.currentChannelName}
                </div>
                <div className="topnav">
                    <Link to="/contacts">Contacts</Link>
                </div>
                <div className="topnav">
                    <Link to="/settings">Settigs</Link>
                </div>
                <Matchmacking />
            </div>
            <Outlet />
        </div>
    )
}

function AuthStatus() {
    let auth = useAuth();
    let navigate = useNavigate();
    let chat = useChat();

    if (!auth.user) {
        return <p>You are not logged in.</p>;
    }

    return (
        <p>
            Welcome {auth.user.username}!{" "}
            <button
                onClick={() => {
                    auth.signout(() => {
                        chat.disconnect();
                        navigate("/");
                    });
                }}
            >
                Sign out
            </button>
        </p>
    );
}
