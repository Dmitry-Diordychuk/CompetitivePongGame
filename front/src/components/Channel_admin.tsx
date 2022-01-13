import React, {useEffect, useState} from "react";
import axios from "axios";
import {useChat} from "../contexts/chat.context";
import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useModal} from "../contexts/modal.context";
import uuidv4 from "../utils/uuid";
import ModalWindow from "./Window";
 
import "../styles/ChannelChat.css";
import '../styles/ChannelRoster.css'
import {useSocketIO} from "../contexts/socket.io.context";
import { MapOrEntries, useMap, useInterval } from 'usehooks-ts';


export default function Channel_admin(on : any) {
    let chat = useChat();
    if (on.on)
    return (
        <div className="div_admin_chat_shadow">
        <div className="div_admin_chat">
            <div>Channel: {chat.currentChannelName}</div>
            <ChatPart />
            <Roster />
        </div>
        </div>
    )
    return (<div></div>)
}

function SingleMessage(msg : any)
{
    const modal = useModal();

    if (msg.username === 'trans_tech_msg')
    {
        return (
            <div style={{margin: '7px'}}>
                <i>{msg.msg.message}</i></div>
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

export function ChatPart()
{
    const chat = useChat();
    const [messages, setMessages] = useState([]);

    //useEffect(() => chat.renewPMI(), [chat.pMI]);

    useEffect(() => {
        setMessages(chat.getCurrentChannelMessages());
    }, [chat])

    if (!messages) {
        return <div>LOADING... </div>
    }

    return (
        <div className='div-chat'>
            {messages.map((msg : any) =>
                <SingleMessage msg={msg} key={msg.id}/>)}
        </div>
    )
}

export function Roster()
{
    const chat: any = useChat();
    const socket = useSocketIO();
    const auth = useAuth();
    const modal = useModal();

    const [visitors, setVisitors] = useState<any[]>([]);
    const [last, setLast] = useState(-15);

    let visibleId : number = chat.getCurrentChannelID()
    useEffect(() => {
        if (visibleId === 10000000090 || visibleId < 0)
            return
        const id = setInterval(() => {
            axios.get("http://localhost:3001/api/channel/" + visibleId,
                {
                    headers :
                        {
                            "authorization" : "Bearer " + auth.user.token,
                        }
                })
                .then((answer : any) => {
                    setLast(visibleId);
                    setVisitors(answer.data.channel.visitors)
                })
                .catch(e => console.log('Chat roster: ' + e))}, 1000)
        return (() => {clearInterval(id)})
    }, [setVisitors, chat, last, visibleId])

    function OnlineLight(name : any)
    {

        const newone = {
            userId : name.name.id
        }
        let in_game = false;

        useInterval(() => {
        socket.emit('is-online', newone)
        socket.emit("is-in-game", newone.userId)}, 1000)
        
        useEffect(() => {
            socket.on('status', (message : any) => {
                chat.onliner.set(message.info['userId'], message.info.status)})
            socket.on("in-game", (message : any) => {

                chat.inGame.set(+message['userId'], message['isOnline']);
            });
            return (
                () => {
                    socket.off("in-game");
                    socket.off('status');
                }
            )
        }, [])
        

        function Onliner()
        {
            if (chat.onliner.get(name.name.id) === true)
                return (
                    <div className='div-online'/>
                )
            return (
                <div className='div-offline'/>
            )
        }

        function InGame()
        {
            if (chat.inGame.get(newone.userId) === true)
                return (
                    <div className='div-ingame'></div>
                )
            return (
                <div className='div-outgame'></div>
            )
        }
        
        return (
            <div>
                <Onliner />
                <InGame />
            </div>
        )
    }

    function Visitor(visitor : any)
    {
        return (
            <div onClick={(event) => modal.summonModalWindow(event, visitor.name)}>
                {visitor.name.username}
                <OnlineLight name={visitor.name} />
            </div>
        )
    }


    let and_you : string = 'and you';
    
    if (chat.getCurrentChannelID() < 0)
    {
        return (
                <div className='div-roster'>
                    Here are {chat.currentChannelName} and you
                </div>)
    }

    return (
        <>
            <ModalWindow />
            <div className='div-roster'>
                {visitors.map((visitor : any) =>
                    <Visitor name={visitor} key={visitor.id}/>)}
            </div>
        </>
    );
}
