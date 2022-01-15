
import React, {useEffect} from "react";
import {useContact} from "../contexts/contact.context";
import {useModal} from "../contexts/modal.context";

import '../styles/Contacts.css'
import ModalWindow from "./Window";

import {useSocketIO} from "../contexts/socket.io.context";

import { MapOrEntries, useMap, useInterval } from 'usehooks-ts';

export default function Contacts() {

    return (
        <>
            <ModalWindow />
            <FriendsList />
            <BlackList />
        </>
    )
}

export function OnlineLight(user : any)
{
    const socket = useSocketIO();
    const contact = useContact();

    const initialValues: MapOrEntries<number, boolean> = [[0, false]];
    const [online, setOnline] = useMap<number, boolean>(initialValues);
    const [inGame, setInGame] = useMap<number, boolean>(initialValues);
  //  const [onLine, setOnLine] = useState<boolean>(false)
   
    const newone = {
        userId : user.user.id
    }

    useInterval(() => {
        socket.emit('is-online', newone)
        socket.emit("is-in-game", newone.userId)}, 1000)
    
    useEffect(() => {
        socket.on('status', (message : any) => {
            setOnline.set(+message.info['userId'], message.info.status);
        })
        socket.on("in-game", (message : any) => {
            setInGame.set(+message['userId'], message['isOnline']);
        })
        return (
            () => {
                socket.off("in-game");
                socket.off('status');
            }
        )
    }, [])

    function Onliner()
    {
        if (online.get(newone.userId) === true)
            return (
                <div className='div-online' />
            )
        return (
            <div className='div-offline'/>
        )
    }

    function InGame()
    {
        if (inGame.get(newone.userId) === true)
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

function FriendsList()
{
    const contact = useContact();
    useEffect(() => {
        const id = setInterval(() => {
            contact.uploadFriendList()}, 1000)
			return (() => {clearInterval(id)})
	})

    return (
        <div className='div-fr'>
            <h3>Friends list</h3>
            {contact.friendList.map((user: any) =>
                <User user={user} key={user.id}/>
            )}
        </div>
    )
}

function BlackList()
{
    const contact = useContact();


   // const contact = useContact();
    useEffect(() => {
        const id = setInterval(() => {
            contact.uploadBlackList()}, 1000)
			return (() => {clearInterval(id)})
	})

 //   contact.uploadBlackList();

    return (
        <div className='div-bl'>
            <h3>Black list</h3>
            {contact.blackList.map((user: any) =>
                <User user={user} key={user.id}/>
            )}
        </div>
    )
}

function User({user}: any)
{
    const modal = useModal();

    return (
        <div className="user-div" onClick={(e) => modal.summonModalWindow(e, user)}>
            {user.username}
            <OnlineLight user={user}/>
        </div>
    )
}
