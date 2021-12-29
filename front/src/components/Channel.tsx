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


export default function Channel() {
    let { id } = useParams<"id">();
    const chat = useChat();

    chat.setCurrentChannel(id);

    return (
        <MessageInput/>
    )
}



function MessageInput()
{
    const chat: any = useChat();
    const auth: any = useAuth();
    const navigate = useNavigate();

    useEffect(() =>
            chat.socket.on("sanction", (arg : any) =>
            {
                let until = new Date(arg.sanction.expiry);
                let msg : string = "At "+ arg.sanction.channel + " channel you are at " + arg.sanction.type + " until " + until;
                let temp =
                    {
                        channel : arg.sanction.channel,
                        userId : 1023942,
                        username : 'trans_tech_msg',
                        id : uuidv4(),
                        message : msg
                    };
                chat.addMessage(temp);
                if (chat.newMessageFlag)
                    chat.toggleNewMessageFlag();
                if (arg.sanction.type === 'ban')
                    chat.deleteChannel(arg.sanction.channel)
            }),
        [chat]);

    function add_new_msg(value : any)
    {
        if (chat.getCurrentChannelID() > 0)
        {
            const newone = {
                channel: chat.currentChannelName,
                message: value.value
            }
            chat.socket.emit("send_message", newone);
        }
        else
        {
            const newone = {
                to: (-(chat.getCurrentChannelID())).toString(),
                message: value.value
            }
            const msg =
                {
                    channel: chat.currentChannelName,
                    id: 1640290061388 + Date.now(),
                    message: value.value,
                    username: auth.user.username,
                }
            chat.socket.emit("send_private_message", newone);
            chat.socket.on("exception", (arg : any) => {})
            chat.addMessage(msg);
        }
        value.value = '';
    }



    function InputItself()
    {
        return (
            <div>
                <input onKeyPress={e =>
                    (e.code === "Enter" || e.code === "NumpadEnter") ?
                        add_new_msg(e.target) : 0}
                            type='text'>
                </input>
            </div>
        )
    }
    return (
        <div>
            <ChatPart />
            <Roster />
            <InputItself />
            <div onClick={() => navigate('/channels', {replace: true})}>
                <h3>Back</h3>
            </div>
        </div>)
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

function ChatPart()
{
    const chat = useChat();
    const [messages, setMessages] = useState([]);

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

function Roster()
{
    const chat: any = useChat();
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
        chat.socket.emit('is-online', newone)
        chat.socket.emit("is-in-game", newone);
        useEffect(() => {
            chat.socket.on('status', (message : any) => {
                chat.onliner.set(message.info['userId'], message.info.status)})
            chat.socket.on("in-game", ((e : any) => {in_game = e}));
        })


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
            if (in_game === true)
                return (
                    <div className='div-ingame'/>
                )
            return (
                <div className='div-outgame'/>
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
