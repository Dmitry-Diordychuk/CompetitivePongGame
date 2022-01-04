import React, {useState} from "react";
import axios from "axios";
import {useAuth} from "../auth/auth.context";

interface ContactContextType {
    friendList: any;
    uploadFriendList: Function;
    addFriend: Function;
    deleteFriend: Function;
    isFriend: Function;

    blackList: any;
    uploadBlackList: Function;
    ban: Function;
    unban: Function;
    isBanned: Function;
}

const ContactContext = React.createContext<ContactContextType>(null!);

export function ContactProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const [friendList, setFriendList] = useState([]);
    const [blackList, setBlackList] = useState([]);

    const uploadFriendList = () => {
        axios({
            method: 'get',
            url: "http://localhost:3001/api/user/friends",
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then((response) => {
            setFriendList(response.data.users);
        }).catch(() => {})
    }

    const addFriend = (userID: number) => {
        axios({
            method: 'put',
            url: "http://localhost:3001/api/user/friends/" + userID,
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then().catch()
    }

    const deleteFriend = (userID : number) => {
        axios({
            method: 'delete',
            url: "http://localhost:3001/api/user/friends/" + userID,
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then().catch()
    }

    const isFriend = (subject: any) => {
        return !!friendList.find((e: any) => e.id === subject.id);

    }

    const uploadBlackList = () => {
        axios({
            method: 'get',
            url: "http://localhost:3001/api/user/blacklist",
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then((response) => {
            setBlackList(response.data.users);
        }).catch(() => null)
    }

    const ban = (userID : number) => {
        axios({
            method: 'put',
            url: "http://localhost:3001/api/user/blacklist/" + userID,
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then().catch()
    }

    const unban = (userID: number) => {
        axios({
            method: 'delete',
            url: "http://localhost:3001/api/user/blacklist/" + userID,
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then().catch()
    }

    const isBanned = (subject: any) => {
        return !!blackList.find((e: any) => e.id === subject.id);
    }

    let value : ContactContextType = {
        friendList,
        uploadFriendList,
        addFriend,
        deleteFriend,
        isFriend,

        blackList,
        uploadBlackList,
        ban,
        unban,
        isBanned,
    };

    return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact() {
    return React.useContext(ContactContext);
}