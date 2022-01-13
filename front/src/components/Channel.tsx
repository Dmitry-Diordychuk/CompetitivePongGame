import React, {useEffect, useState} from "react";
import axios from "axios";
import {useChat} from "../contexts/chat.context";
import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useModal} from "../contexts/modal.context";
import uuidv4 from "../utils/uuid";
import ModalWindow from "./Window";

import "../styles/ChannelChat.css";
import '../styles/ChannelRoster.css';
import {useSocketIO} from "../contexts/socket.io.context";
import {useInterval} from 'usehooks-ts';


export default function Channel() {
    const chat: any = useChat();
    const socket = useSocketIO();
    const navigate = useNavigate();

    useInterval(() => {
        socket.emit('channel-info', {name: chat.currentChannelName});
    }, 1000);

    return (
        <>
            <h3>{chat.currentChannelName}</h3>
            <ChatOutput />
            <ChatRoster
                visitors={chat.channels.find((ch: any) => ch.name === chat.currentChannelName)?.visitors}
                admins={chat.channels.find((ch: any) => ch.name === chat.currentChannelName)?.admins}
                owner={chat.channels.find((ch: any) => ch.name === chat.currentChannelName)?.owner}
            />
            <ChatInput />
            <div onClick={() => navigate('/channels', {replace: true})}>
                <h3>Back</h3>
            </div>
        </>
    )
}

function ChatInput()
{
    const socket = useSocketIO();
    const chat = useChat();
    const auth = useAuth();

    function addNewMessage(value : any)
    {
        if (chat.getCurrentChannelID() > 0)
        {
            const newone = {
                channel: chat.currentChannelName,
                message: value.value
            }
            socket.emit("send_message", newone);
        }
        else
        {
            const newone = {
                to: (-(chat.getCurrentChannelID())).toString(),
                message: value.value
            }
            const msg = {
                channel: chat.currentChannelName,
                id: 1640290061388 + Date.now(),
                message: value.value,
                username: auth.user.username,
            }
            socket.emit("send_private_message", newone);
            socket.on("exception", (arg : any) => {})
            chat.addMessage(msg);
        }
        value.value = '';
    }

    return (
        <div>
            <input onKeyPress={e =>
                (e.code === "Enter" || e.code === "NumpadEnter") ?
                    addNewMessage(e.target) : 0}
                   type='text' autoFocus={true}>
            </input>
        </div>
    )
}

    // useEffect(() => {
    //     socket.on("sanction", (arg : any) =>
    //     {
    //         let until = new Date(arg.sanction.expiry);
    //         let msg : string = "At "+ arg.sanction.channel + " channel you are at " + arg.sanction.type + " until " + until;
    //         let temp =
    //             {
    //                 channel : arg.sanction.channel,
    //                 userId : 1023942,
    //                 username : 'trans_tech_msg',
    //                 id : uuidv4(),
    //                 message : msg
    //             };
    //         chat.addMessage(temp);
    //         if (chat.newMessageFlag)
    //             chat.toggleNewMessageFlag();
    //         if (arg.sanction.type === 'ban')
    //             chat.deleteChannel(arg.sanction.channel)
    //
    //     })
    //     return (socket.off("sanction"))
    // },
    // [chat]);


function SingleMessage(msg : any)
{
    const modal = useModal();

    if (msg.username === 'trans_tech_msg')
    {
        return (
            <div style={{margin: '7px'}}>
                <i>{msg.msg.message}</i>
            </div>
        )
    }
    return (
        <div style={{margin: '7px'}}>
            <i onClick={(e) => modal.summonModalWindow(e, msg.msg)}>
                {msg.msg.username}
            </i><br />
            {msg.msg.message}
        </div>
    )
}

export function ChatOutput()
{
    const chat = useChat();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        setMessages(chat.getCurrentChannelMessages());
    }, [chat.channels]);

    if (!messages) {
        return <div>LOADING... </div>
    }

    return (
        <div className='div-chat'>
            {messages.map((msg : any) =>
                <SingleMessage msg={msg} key={msg.id}/>)}
        </div>
    );
}

export function ChatRoster(props: any)
{
    // if (chat.getCurrentChannelID() < 0)
    // {
    //     return (
    //         <div className='div-roster'>
    //             Here are {chat.currentChannelName} and you
    //         </div>
    //     )
    // }

    return (
        <>
            <ModalWindow />
            <div className='div-roster'>
                {props.visitors.map((visitor : any) =>
                    <Visitor
                        username={visitor.username}
                        isOnline={!!visitor.isOnline}
                        isInGame={!!visitor.isInGame}
                        key={visitor.id}
                    />)}
            </div>
        </>
    );
}

function Visitor(props: any)
{
    const modal = useModal();

    return (
        <div onClick={(event) => modal.summonModalWindow(event, props.username)}>
            {props.username}
            <Status
                isOnline={props.isOnline}
                isInGame={props.isInGame}
            />
        </div>
    )
}

function Status(props: any)
{
    function Online()
    {
        if (props.isOnline === true)
            return (
                <div className='div-online'/>
            )
        return (
            <div className='div-offline'/>
        )
    }

    function InGame()
    {
        if (props.isInGame === true)
            return (
                <div className='div-ingame'></div>
            )
        return (
            <div className='div-outgame'></div>
        )
    }

    return (
        <div>
            <Online />
            <InGame />
        </div>
    )
}