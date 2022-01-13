import React, {useCallback, useEffect, useRef, useState} from "react";
import uuidv4 from "../utils/uuid";
import axios from "axios";
import {useSocketIO} from "./socket.io.context";
import {useAuth} from "../auth/auth.context";
import {useEffectOnce} from "usehooks-ts";
import {useContact} from "./contact.context";


interface ChatContextType {
    channels: any;
    addNewChannel: Function;
    deleteChannel: Function;

    setCurrentChannel: Function;
    currentChannelName: string;
    getCurrentChannelID: Function;

    getCurrentChannelMessages: Function;

    getVisibleChannelAdmins: Function;
    removeAdminChannels: Function;

    onliner: any;
    inGame : Map<number, boolean>;
    pMI : any[];
    renewPMI : Function;
}

const ChatContext = React.createContext<ChatContextType>(null!);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const socket = useSocketIO();
    const auth = useAuth();
    const contact = useContact();

    const [channels, setChannels] = useState<any>([]);
    const [currentChannelName, setCurrentChannelName] = React.useState<any>(null);

    let onliner : Map<number, boolean> = new Map();
    let inGame : Map<number, boolean> = new Map();

    const [pMI, setPMI] = useState<any[]>([]);

    useEffect(() => {
        setCurrentChannelName('general');
        if (auth.user) {
            axios.get("http://localhost:3001/api/channel/all/current/", {
                method: 'get',
                url: "http://localhost:3001/api/channel/all/current/",
                responseType: "json",
                headers: {
                    "authorization": 'Bearer ' + auth.user.token,
                },
            })
                .then((response: any) => {
                    initChannels(response.data.channels);
                })
                .catch(
                    e => console.log('Chat context roster failed: ' + e)
                );
        }
    }, [socket, auth.user]);

    const renewPMI = useCallback(() => {
        let prvMsgClear = pMI.filter((chan : any) => chan.name !== currentChannelName);
        setPMI(prvMsgClear);
    }, [currentChannelName, pMI]);

    const initChannels = useCallback((data : any) => {
        let move_on : boolean = false;
        let curr_channel : string = 'general';
        let number_or_not : any = 0;

        setChannels([...(data.map((ch : any) : any => {
            let msgs : any = sessionStorage.getItem(auth.getId() + '\n' + ch.name);
            if (msgs)
            {
                move_on = true;
                msgs = JSON.parse(msgs);
            }
            else
                msgs = []
            return (Object.assign({}, ch, {messages: msgs}))
        }))]);

        if (move_on)
        {
            number_or_not = Number(window.location.pathname.split('/')[2])
            if (number_or_not && number_or_not > -1) {
                curr_channel = channels.find((item: any) =>
                    item.id === number_or_not).name;
            }
        }

        setCurrentChannelName(curr_channel);
    }, [channels, sessionStorage]);

    const addNewChannel = useCallback( (channel: any) => {
        if (channels.find((i:any) => i.id === channel.id))
            return;
        let new_channel: any = {
            id: 0,
            name: "new_one",
            owner: null,
            admins: [],
            sanctions: [],
            visitors: [],
            messages: []
        };
        new_channel.owner = channel.owner;
        new_channel.name = channel.channel;
        new_channel.id = channel.id;
        if (channel.asAdmin === true)
            new_channel.asAdmin = true;
        else
            new_channel.asAdmin = false;
        new_channel.visitors = channel['visitors']
        let act : any = channels.find((item : any) => item.id === new_channel.id);
        if (act)
            return;
        setChannels([...channels, new_channel]);
    }, [channels]);

    useEffectOnce(() => {
        socket.on("receive_private_message", (message: any) => {
            message = {
                id: uuidv4(),
                ...message.message,
            };
            addPrivateMessage(message)
        });
        return (()=> {
            socket.off("receive_private_message");
        })
    });

    const addPrivateMessage = useCallback((message : any) =>
	{
		let act : any = channels.find((item : any) =>
			item.id === -(message.userId));
		if (act)
			act.messages.unshift(message);
		else
		{
			let newchan = 
			{
				channel: message.username,
				id: -(message.userId),
				visitors: [message.username,]
			}
			addNewChannel(newchan)
			act = channels.find((item : any) => item.id === -(message.userId));
			if (act)
				act.messages.unshift(message);
		}
        let temp_msg = {
            name : message.username,
            id : -(message.userId)
        }
        let temp_chan = pMI.filter((chan : any) => chan.name !== temp_msg.name);
        temp_chan.push(temp_msg)
        setPMI(temp_chan);
	}, [channels, pMI]);

    const addMessage = useCallback((data : any) => {
        const message: any = {
            id: uuidv4(),
            ...data.message,
        };

        let isBanned = contact.blackList.find((user: any) => user.username === message.username)
        if (!!isBanned)
            return;

        let index : any = channels.findIndex((item : any) => item.name === message.channel);
        if (index !== -1)
        {
            channels[index].messages.unshift(message);
            let pack = JSON.stringify(channels[index].messages);
            sessionStorage.setItem(auth.getId() + '\n' + message.channel, pack);
            setChannels([...channels]);
        }
    }, [channels, sessionStorage, contact.blackList]);

    useEffect(() => {
        socket.on("receive_message", addMessage);
        return (()=>{
            socket.off('receive_message');
        })
    }, [addMessage]);

    const deleteChannel = useCallback((name : string) => {
        if (name === currentChannelName)
        {
            if (name === channels[0].name) {
                setCurrentChannelName(channels[0].name);
            } else {
                setCurrentChannelName(channels[1].name);
            }
        }
        setChannels([...channels].filter((chan : any) => chan.name !== name))
        socket.emit("leave_channel", {"name" : name});
    }, [channels, currentChannelName]);

    const getCurrentChannelID = useCallback((): number => {
        let current : any = channels.find((item : any) => item.name === currentChannelName);
        if (!current)
            return 10000000090
        return (current.id);
    }, [channels, currentChannelName]);

    const setCurrentChannel = useCallback((id: number) => {
        let current : any = channels.find((item : any) => +item.id === +id);
        if (!current)
            return ;
        setCurrentChannelName(current.name);
    }, [channels]);

    const getCurrentChannelMessages = useCallback(() => {
        const channel = channels.find((ch: any) => ch.name === currentChannelName)
        if (channel)
            return channel.messages;
        return ([])
    }, [channels, currentChannelName]);

    const getVisibleChannelAdmins = useCallback(() : any[] => {
        let current : any = channels.find((item : any) => item.name === currentChannelName);
        if (!current)
            return []
        if (!current.owner)
            return (current.admins)
        return ([...current.admins, current.owner]);
    }, [channels, currentChannelName]);

    const removeAdminChannels = useCallback(() : any => {
        // console.log('chat.context removeAdminChannels');
        // setChannels(channels.filter((i: any) => i.asAdmin !== true))
    }, [channels]);

    let value : ChatContextType = {
        channels,
        addNewChannel,
        deleteChannel,

        setCurrentChannel,
        currentChannelName,
        getCurrentChannelID,

        getCurrentChannelMessages,

        getVisibleChannelAdmins,
        removeAdminChannels,

        onliner,
        inGame,
        pMI,
        renewPMI,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
    return React.useContext(ChatContext);
}