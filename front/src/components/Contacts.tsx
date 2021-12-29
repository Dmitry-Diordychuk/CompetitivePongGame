import React, {useEffect} from "react";
import axios from "axios";
import {useContact} from "../contexts/contact.context";
import {useModal} from "../contexts/modal.context";

import '../styles/Contacts.css'

export default function Contacts() {

    return (
        <>
            <FriendsList />
            <BlackList />
        </>
    )
}

function FriendsList()
{
    const contact = useContact();
    const modal = useModal();

    useEffect(() =>
    {
        axios(contact.generateRequestOptions('friends'))
            .then((answer : any) => contact.axiosLoading(answer, 'friends'))
            .catch(e => console.log('Axios loading: ' + e))
    }, [contact])

    function SingleMan(man : any)
    {
        return (
            <div onClick={(e) => modal.summonModalWindow(e, man.man)}>
                {man.man.username}
            </div>
        )
    }

    return (<div className='div-fr'><h3>Friends list</h3>
        {contact.friendList.map((man : any) =>
            <SingleMan man={man} key={man.id}/>)}
    </div>)
}

function BlackList()
{
    const contact = useContact();
    const modal = useModal();

    useEffect(() =>
    {
        axios(contact.generateRequestOptions('blacklist'))
            .then((answer : any) => contact.axiosLoading(answer, 'blacklist'))
            .catch(e => console.log('Axios loading: ' + e))
    }, [contact])

    function SingleMan(man : any)
    {
        return (
            <div onClick={(e) => modal.summonModalWindow(e, man.man)}>
                {man.man.username}
            </div>
        )
    }

    return (<div className='div-bl'><h3>Black list</h3>
        {contact.blackList.map((man : any) =>
            <SingleMan man={man} key={man.id}/>)}
    </div>)
}
