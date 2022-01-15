import React from "react";
import {useChat} from "../contexts/chat.context";
import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useModal} from "../contexts/modal.context";
import ModalWindow from "./Window";
import "../styles/ChannelChat.css";
import '../styles/ChannelRoster.css';
import {useSocketIO} from "../contexts/socket.io.context";
import {useInterval} from 'usehooks-ts';


export default function Channel() {
    const chat: any = useChat();
    const socket = useSocketIO();
    const navigate = useNavigate();
    const params = useParams();
    const modal = useModal();

    chat.setCurrentChannelName(params.id);

    useInterval(() => {
        if (!modal.isActive && !Number.isInteger(+chat.currentChannelName))
            socket.emit('channel-info', {name: chat.currentChannelName});
    }, 1000);

    let currentChannel = chat.channels.find((ch: any) => ch.name === chat.currentChannelName);
    if (Number.isInteger(+chat.currentChannelName)) {
        currentChannel = chat.privateChannels.find((ch: any) => ch.id === +chat.currentChannelName);
    }

    // console.log(chat.currentChannelName);
    console.log(currentChannel)
    console.log(chat.privateChannels)
    //console.log(currentChannel?.message)

    return (
        <>
            <h3>{chat.currentChannelName}</h3>
            <ChatOutput messages={currentChannel?.messages} />
            <ChatRoster
                visitors={currentChannel?.visitors}
                admins={currentChannel?.admins}
                owner={currentChannel?.owner}
                sanctions={currentChannel?.sanctions}
                currentChannelId={currentChannel?.id}
                currentChannelName={currentChannel?.name}
                isPrivate={Number.isInteger(+chat.currentChannelName)}
            />
            <ChatInput
                isPrivate={Number.isInteger(+chat.currentChannelName)}
                channelId={+chat.currentChannelName}
                channelName={currentChannel?.name}
            />
            <button onClick={() => navigate('/channels', {replace: true})}>
                Back
            </button>
        </>
    )
}

function ChatInput(props: any)
{
    const socket = useSocketIO();
    const chat = useChat();
    const auth = useAuth();

    function addNewMessage(value : any)
    {
        if (!props.isPrivate) {
            const newOne = {
                channel: chat.currentChannelName,
                message: value.value
            }
            socket.emit("send_message", newOne);
        } else {
            const newOne = {
                to: chat.currentChannelName,
                message: value.value
            }
            const message = {
                message: value.value,
                userId: auth.user.id,
                username: auth.user.username,
            }

            socket.emit("send_private_message", newOne);
            chat.addPrivateMessage({message}, props.channelId, props.channelName);
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