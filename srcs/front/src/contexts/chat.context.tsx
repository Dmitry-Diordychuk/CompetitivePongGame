import React, {useCallback, useEffect, useRef, useState} from "react";
import uuidv4 from "../utils/uuid";
import axios from "axios";
import {useSocketIO} from "./socket.io.context";
import {useAuth} from "../auth/auth.context";
import {useContact} from "./contact.context";
import {useNavigate} from "react-router-dom";


interface ChatContextType {
    channels: any;
    addNewChannel: Function;
    deleteChannel: Function;
    updateChannel: Function;
    updateChannels: Function;

    setCurrentChannelName: Function;
    currentChannelName: string;
    getCurrentChannelID: Function;
    getCurrentChannelMessages: Function;

    addMessage: Function;
    addPrivateMessage: Function;

    getVisibleChannelAdmins: Function;
    removeAdminChannels: Function;

    addNewPrivateChannel: Function;
    deletePrivateChannel: Function;
    privateChannels: any;
}

const ChatContext = React.createContext<ChatContextType>(null!);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const socket = useSocketIO();
    const auth = useAuth();
    const contact = useContact();
    const navigate = useNavigate();

    const [channels, setChannels] = useState<any>([]);
    const [currentChannelName, setCurrentChannelName] = React.useState<any>(null);

    const [privateChannels, setPrivateChannels] = useState<any>([]);

    useEffect(() => {
        socket.on('channel-info-response', updateChannel);
        return (() => {
            socket.off('channel-info-response')
        })
    }, [channels, socket]);

    const updateChannel = useCallback((channel: any) => {
        if (!channel) {
            setCurrentChannelName('general');
            navigate('/channels', {replace: true});
            return;
        }

        let current : any = channels.find((item : any) => item.name === channel.name);

        if (!current) {
            return;
        }

        current.admins = channel.admins;
        current.name = channel.name;
        current.owner = channel.owner;
        current.sanctions = channel.sanctions;
        current.visitors = channel.visitors;
        setChannels([...channels]);
    }, [socket, channels]);

    useEffect(() => {
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
                e => console.log('Channels first init failed: ' + e)
            );
        }
    }, [socket, auth.user]);

    const initChannels = useCallback((data : any) => {
        let move_on : boolean = false;
        let curr_channel : string = 'general';
        let number_or_not : any = 0;

        setChannels([...(data.map((ch : any) : any => {
            let msgs : any = sessionStorage.getItem( 'public' + auth.getId() + '\n' + ch.name);
            if (msgs)
            {
                move_on = true;
                msgs = JSON.parse(msgs);
            }
            else
                msgs = []
            return (Object.assign({}, ch, {messages: msgs}))
        }))]);

        const refreshedPrivateChannels: any[] = [];
        const sessionPrivateMessagesData = sessionStorage.getItem('private' + auth.getId());
        if (sessionPrivateMessagesData) {
            const privateMessages: any = JSON.parse(sessionPrivateMessagesData);
            for (let i = 0; i < privateMessages.length; i++) {
                let current = refreshedPrivateChannels.find((ch: any) => ch.id === privateMessages[i].toChannelId);
                if (current) {
                    current.messages.push(privateMessages[i]);
                } else {
                    refreshedPrivateChannels.push({
                        id: privateMessages[i].toChannelId,
                        name: privateMessages[i].toChannelName,
                        owner: null,
                        admins: [],
                        sanctions: [],
                        visitors: [],
                        messages: [privateMessages[i]],
                    });
                }
            }
            setPrivateChannels(refreshedPrivateChannels);
        }

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

    const updateChannels = useCallback((data: any) => {
        const channelsUpdated = data.map((ch: any) => {
            const channel = channels.find((chan: any) => chan.name === ch.name);
            if (channel) {
                ch = {...ch, messages: channel.messages};
            } else {
                ch = {...ch, messages: []};
            }
            return ch;
        });
        const current = channelsUpdated.find((ch: any) => ch.name === currentChannelName);
        if (!current) {
            setCurrentChannelName('general');
        }
        setChannels([...channelsUpdated]);
    }, [channels, currentChannelName]);

    const addNewChannel = useCallback( (channel: any) => {
        if (channels.find((i:any) => i.id === channel.id))
            return;
        let newChannel: any = {
            id: 0,
            name: "new_one",
            owner: null,
            admins: [],
            sanctions: [],
            visitors: [],
            messages: []
        };
        newChannel.owner = channel.owner;
        newChannel.name = channel.channel;
        newChannel.id = channel.id;
        if (channel.asAdmin === true)
            newChannel.asAdmin = true;
        else
            newChannel.asAdmin = false;
        newChannel.visitors = channel['visitors']
        let act : any = channels.find((item : any) => item.id === newChannel.id);
        if (act)
            return;
        setChannels([...channels, newChannel]);
    }, [channels]);

    const addNewPrivateChannel = useCallback( (channel: any) => {
        if (privateChannels.find((i:any) => i.id === channel.id))
            return;
        let newChannel: any = {
            id: 0,
            name: "new_one",
            owner: null,
            admins: [],
            sanctions: [],
            visitors: [],
            messages: [],
        };
        newChannel.owner = channel.owner;
        newChannel.name = channel.channel;
        newChannel.id = channel.id;
        newChannel.visitors = channel['visitors']
        let current : any = privateChannels.find((item : any) => item.id === newChannel.id);
        if (current)
            return;
        setPrivateChannels([...privateChannels, newChannel]);
    }, [privateChannels]);

    useEffect(() => {
        socket.on("receive_private_message", (message: any) => {
            addPrivateMessage(message, message.message.userId, message.message.username);
        });
        return (()=> {
            socket.off("receive_private_message");
        })
    }, [privateChannels]);

    const addPrivateMessage = useCallback((message : any, toChannelId: number, toChannelName: string) =>
	{
        message = message.message;
        message.id = uuidv4();
        message.toChannelId = toChannelId;
        message.toChannelName = toChannelName;

		let current : any = privateChannels.find((ch : any) => ch.id === toChannelId);

        console.log(current, privateChannels);

		if (current) {
            current.messages = [message, ...current.messages];
            sessionStorage.setItem('private' + auth.getId(), JSON.stringify(current.messages));
            setPrivateChannels([...privateChannels]);
        } else {
            let newChannel: any = {
                id: toChannelId,
                name: toChannelName,
                owner: null,
                admins: [],
                sanctions: [],
                visitors: [message.username],
                messages: [message],
            };
            sessionStorage.setItem('private' + auth.getId(), JSON.stringify([message]));
            setPrivateChannels([...privateChannels, newChannel]);
		}
	}, [privateChannels, auth.user]);


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
            sessionStorage.setItem('public' + auth.getId() + '\n' + message.channel, pack);
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
        if (name === currentChannelName) {
            setCurrentChannelName('general');
        }
        setChannels([...channels].filter((ch : any) => ch.name !== name))
        socket.emit("leave_channel", {"name" : name});
    }, [channels, currentChannelName]);

    const deletePrivateChannel = useCallback((name : string) => {
        if (name === currentChannelName) {
            setCurrentChannelName('general');
        }
        setPrivateChannels([...privateChannels].filter((ch : any) => ch.name !== name))
    }, [channels, currentChannelName]);

    const getCurrentChannelID = useCallback((): number => {
        let current : any = channels.find((item : any) => item.name === currentChannelName);
        if (!current)
            return 10000000090
        return (current.id);
    }, [channels, currentChannelName]);

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
        // setChannels(channels.filter((i: any) => i.asAdmin !== true))
    }, [channels]);

    let value : ChatContextType = {
        channels,

        addNewChannel,
        deleteChannel,
        updateChannel,
        updateChannels,

        setCurrentChannelName,
        currentChannelName,
        getCurrentChannelID,
        getCurrentChannelMessages,

        addMessage,
        addPrivateMessage,

        getVisibleChannelAdmins,
        removeAdminChannels,

        addNewPrivateChannel,
        deletePrivateChannel,
        privateChannels,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
    return React.useContext(ChatContext);
}