import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useModal} from "../contexts/modal.context";
import ModalWindow from "./Window";
import "../styles/ChannelChat.css";
import '../styles/ChannelRoster.css';
import {useSocketIO} from "../contexts/socket.io.context";
import {useInterval} from 'usehooks-ts';
import uuidv4 from "../utils/uuid";


export default function AdminChannelView() {
    const socket = useSocketIO();
    const navigate = useNavigate();

    const [currentChannel, setCurrentChannel] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [flag, setFlag] = useState(false);

    const params = useParams();
    const currentChannelName = params["id"];

    socket.emit('admin_join_channel', {
        name: currentChannelName,
        password: 'secret',
    })
    socket.once("exception", (data : any) => {
        navigate('/404');
    })

    useInterval(() => {
        socket.emit('channel-info', {name: currentChannelName});
        setFlag(true);
    }, 1000);
    useEffect(() => {
        socket.once('channel-info-response', (data: any) => {
            setCurrentChannel(data);
            setFlag(false);
        });
        return (() => {
            socket.off('channel-info-response')
        })
    }, [flag]);

    const addMessage = useCallback((data : any) => {
        const message: any = {
            id: uuidv4(),
            ...data.message,
        };

        if (message.channel === currentChannelName) {
            messages.unshift(message);
            setMessages([...messages]);
        }
    }, [messages, currentChannelName]);

    useEffect(() => {
        socket.on("receive_message", addMessage);
        return (()=>{
            socket.off('receive_message');
        })
    }, [addMessage]);

    return (
        <>
            <h3>{currentChannel?.currentChannelName}</h3>
            <ChatOutput messages={messages} />
            <ChatRoster
                visitors={currentChannel?.visitors}
                admins={currentChannel?.admins}
                owner={currentChannel?.owner}
                sanctions={currentChannel?.sanctions}
                currentChannelId={currentChannel?.id}
                currentChannelName={currentChannel?.name}
                isPrivate={Number.isInteger(+currentChannel?.currentChannelName)}
            />
            <button onClick={() => navigate('/admin', {replace: true})}>
                Back
            </button>
        </>
    )
}

function SingleMessage(props : any)
{
    if (props.username === 'trans_tech_msg')
    {
        return (
            <div style={{margin: '7px'}}>
                <i>{props.message.message}</i>
            </div>
        )
    }
    return (
        <div style={{margin: '7px'}}>
            <i>
                {props.message.username}
            </i><br />
            {props.message.message}
        </div>
    )
}

export function ChatOutput(props: any)
{
    if (!props.messages) {
        return <div className='div-chat'></div>
    }

    return (
        <div className='div-chat'>
            {props.messages.map((message : any) =>
                <SingleMessage message={message} key={message.id}/>)}
        </div>
    );
}

export function ChatRoster(props: any)
{
    if (props.isPrivate)
    {
        return (
            <div className='div-roster'>
                Here are {props.currentChannelName} and you
            </div>
        )
    }

    return (
        <>
            <ModalWindow />
            <div className='div-roster'>
                {props.visitors?.map((visitor : any) =>
                    <Visitor
                        visitor={visitor}
                        userid={visitor.id}
                        username={visitor.username}
                        isOnline={!!visitor.isOnline}
                        isInGame={!!visitor.isInGame}
                        isAdmin={!!props.admins.find((user: any) => user.id === visitor.id)}
                        isOwner={props.owner?.id === visitor.id}
                        sanction={props.sanctions.find((sanction: any) => sanction.target.id === visitor.id)}
                        key={visitor.id}
                    />)}
            </div>
        </>
    );
}

function Visitor(props: any) {
    const modal = useModal();

    let usernameWithTitles = props.username;
    if (props.isAdmin) {
        usernameWithTitles = props.username + " Admin";
    } else if (props.isOwner) {
        usernameWithTitles = props.username + " Owner"
    }

    if (props.sanction && (new Date(props.sanction?.expiry_at)).getTime() > Date.now()) {
        if (props.sanction.type === 'mute') {
            usernameWithTitles += " (muted)";
        } else if (props.sanction.type === 'ban') {
            usernameWithTitles += " (banned)";
        }
    }

    return (
        <div onClick={(event) => modal.summonModalWindow(event, props.visitor)}>
            {usernameWithTitles}
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