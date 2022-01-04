import React from "react";
import {useModal} from "../contexts/modal.context";

import '../styles/Contacts.css'
import ModalWindow from "./Window";
import {useFetch} from "usehooks-ts";
import {useAuth} from "../auth/auth.context";

export default function Contacts() {

    return (
        <>
            <ModalWindow />
            <FriendsList />
            <BlackList />
        </>
    )
}

function FriendsList()
{
    const auth = useAuth();
    const { data, error } = useFetch<any>("http://localhost:3001/api/user/friends", {
        method: 'get',
        headers: {
            "Authorization" : "Bearer " + auth.user.token,
        }
    });

    if (error) return <p>Error...</p>
    if (!data) return <p>Loading</p>
    return (
        <div className='div-fr'>
            <h3>Friends list</h3>
            {data.users.map((user: any) =>
                <User user={user} key={user.id}/>
            )}
        </div>
    )
}

function BlackList()
{
    const auth = useAuth();
    const { data, error } = useFetch<any>("http://localhost:3001/api/user/blacklist", {
        method: 'get',
        headers: {
            "Authorization" : "Bearer " + auth.user.token,
        }
    });

    if (error) return <p>Error...</p>
    if (!data) return <p>Loading</p>
    return (
        <div className='div-bl'>
            <h3>Black list</h3>
            {data.users.map((user: any) =>
                <User user={user} key={user.id}/>
            )}
        </div>
    )
}

function User({user}: any)
{
    const modal = useModal();

    return (
        <div onClick={(e) => modal.summonModalWindow(e, user)}>
            {user.username}
        </div>
    )
}
