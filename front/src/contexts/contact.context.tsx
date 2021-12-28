import React, {useState} from "react";
import {AxiosRequestConfig} from "axios";

interface ContactContextType {
    friendList: any;
    isFriend: Function;
    addFriend: Function;
    deleteFriend: Function;

    blackList: any;
    isBanned: Function;
    ban: Function;
    unban: Function;

    generateRequestOptions: Function;
    axiosLoading: Function;
}

const ContactContext = React.createContext<ContactContextType>(null!);

export function ContactProvider({ children }: { children: React.ReactNode }) {

    const [friendList, setFriendList] = useState([]);
    const [blackList, setBlackList] = useState([]);

    const isFriend = (subject: any) => {
        if (friendList.find((e : any) => e.id === subject.id))
            return true;
        return false;
    }

    const isBanned = (subject: any) => {
        if (blackList.find((e : any) => e.id === subject.id))
            return true;
        return false;
    }

    const addFriendRequest: any = {
        method: 'put',
        url: "http://localhost:3001/api/user/friends/",
        responseType: "json",
        headers: {
            "authorization" : ""
        }
    }

    const deleteFriendRequest: any = {
        method: 'delete',
        url: "http://localhost:3001/api/user/friends/",
        responseType: "json",
        headers: {
            "authorization" : ""
        }
    }

    const friendsRequest: AxiosRequestConfig = {
        method: 'get',
        url: "http://localhost:3001/api/user/friends/",
        responseType: "json",
        headers: {
            "authorization" : ""
        }
    }

    const blacklistRequest: AxiosRequestConfig = {
        method: 'get',
        url: "http://localhost:3001/api/user/blacklist/",
        responseType: "json",
        headers: {
            "authorization" : ""
        }
    }

    const addBlacklistRequest: AxiosRequestConfig = {
        method: 'put',
        url: "http://localhost:3001/api/user/blacklist/",
        responseType: "json",
        headers : {
            "authorization" : ""
        }
    }

    const deleteBlacklistRequest: AxiosRequestConfig = {
        method: 'delete',
        url: "http://localhost:3001/api/user/blacklist/",
        responseType: "json",
        headers : {
            "authorization" : ""
        }
    }

    const unban = (userID: number, token: string) => {
        deleteBlacklistRequest.url = "http://localhost:3001/api/user/blacklist/" + userID;
        deleteBlacklistRequest.headers = {
            "authorization" : "Bearer " + token,
        }
    }

    const ban = (userID : number, token: string) => {
        addBlacklistRequest.url = "http://localhost:3001/api/user/blacklist/" + userID;
        addBlacklistRequest.headers = {
            "authorization" : "Bearer " + token,
        }
    }

    const addFriend = (userID: number, token: string) => {
        addFriendRequest.url = "http://localhost:3001/api/user/friends/" + userID;
        addFriendRequest.headers = {
            "authorization" : "Bearer " + token,
        }
    }

    const deleteFriend = (userID : number, token: string) => {
        deleteFriendRequest.url = "http://localhost:3001/api/user/friends/" + userID;
        deleteFriendRequest.headers = {
            "authorization" : "Bearer " + token,
        }
    }

    // public init(react_state : Function) : void
    //         {
    //             [this.blacklist, this.setBlackList] = react_state([]);
    //     [this.friends, this.setFriends] = react_state([]);
    // }

    const axiosLoading = (request: any, options: string) : void => {
        if (options === 'friends' || options === 'add_friend' || options === 'delete_friend')
            setFriendList(request.data.users);
        if (options === 'blacklist' || options === 'delete_blacklist')
            setBlackList(request.data.users);
        if (options === 'add_blacklist')
            setBlackList(request.data.users);
    }

    const generateRequestOptions = (options: string, token: string): AxiosRequestConfig => {
        if (options === 'friends')
        {
            friendsRequest["headers"] = {"authorization" : "Baerer " + token}
            return (friendsRequest);
        }
        else if (options === 'add_friend')
        {
            addFriendRequest["headers"] = {"authorization" : "Baerer " + token}
            return (addFriendRequest);
        }
        else if (options === 'delete_friend')
        {
            deleteFriendRequest["headers"] = {"authorization" : "Baerer " + token}
            return (deleteFriendRequest);
        }
        else if (options === 'add_blacklist')
        {
            addBlacklistRequest["headers"] = {"authorization" : "Baerer " + token}
            return (addBlacklistRequest);
        }
        else if (options === 'delete_blacklist')
        {
            deleteBlacklistRequest["headers"] = {"authorization" : "Baerer " + token}
            return (deleteBlacklistRequest)
        }
        else if (options === 'blacklist')
        {
            blacklistRequest["headers"] = {"authorization" : "Baerer " + token}
            return (blacklistRequest);
        }

        return ({
            method: 'head',
            url: "",
        });
    }

    // public getBlacklist() : any
    //     {
    //         return (this.blacklist);
    //     }

    let value : ContactContextType = {
        friendList,
        isFriend,
        addFriend,
        deleteFriend,

        blackList,
        isBanned,
        ban,
        unban,

        generateRequestOptions,
        axiosLoading,
    };

    return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact() {
    return React.useContext(ContactContext);
}