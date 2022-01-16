import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {useAuth} from "../auth/auth.context";
import {useNavigate} from "react-router-dom";


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
    const [friendList, setFriendList] = useState<any[]>([]);
    const [blackList, setBlackList] = useState<any[]>([]);

    useEffect(() => {
        uploadFriendList();
        uploadBlackList();
    }, [auth.user]);

    const uploadFriendList = useCallback(() => {
        if (!auth.user)
            return;
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
    }, [auth.user]);

    const addFriend = useCallback((userID: number) => {
        axios({
            method: 'put',
            url: "http://localhost:3001/api/user/friends/" + userID,
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then((response) => {
            setFriendList(response.data.users);
        }).catch(() => {});
    }, [auth.user]);

    const deleteFriend = useCallback((userID : number) => {
        axios({
            method: 'delete',
            url: "http://localhost:3001/api/user/friends/" + userID,
            responseType: "json",
            headers: {
                "Authorization": "Bearer " + auth.user.token,
            },
        }).then((response) => {
            setFriendList(response.data.users);
        }).catch(() => {
        });
    }, [auth.user]);

    const isFriend = useCallback((subject: any) => {
        return !!friendList.find((e: any) => +e.id === +subject.id);
    }, [friendList, auth.user, uploadFriendList, addFriend, deleteFriend]);

    const uploadBlackList = useCallback(() => {
        if (!auth.user)
            return;
        axios({
            method: 'get',
            url: "http://localhost:3001/api/user/blacklist",
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then((response) => {
            setBlackList([...response.data.users]);
        }).catch(() => null)
    }, [auth.user]);

    const ban = useCallback((userID : number, errorCallback: Function) => {
        axios({
            method: 'put',
            url: "http://localhost:3001/api/user/blacklist/" + userID,
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then((response) => {
            setBlackList([...response.data.users]);
        }).catch(() => {
            errorCallback();
        })
    }, [auth.user]);

    const unban = useCallback((userID : number, errorCallback: Function) => {
        axios({
            method: 'delete',
            url: "http://localhost:3001/api/user/blacklist/" + userID,
            responseType: "json",
            headers: {
                "Authorization" : "Bearer " + auth.user.token,
            },
        }).then((response) => {
            setBlackList([...response.data.users]);
        }).catch(() => {
            errorCallback();
        })
    }, [auth.user]);

    const isBanned = useCallback((subject: any) => {

        return !!blackList.find((e: any) => +e.id === +subject.id);
    }, [blackList, auth.user, uploadBlackList, ban, unban]);

    useEffect(uploadFriendList, [auth.user]);
    useEffect(uploadBlackList, [auth.user]);

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