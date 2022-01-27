import React, {useCallback, useEffect, useState} from "react";
import uuidv4 from "../utils/uuid";
import axios from "axios";
import {useSocketIO} from "./socket.io.context";
import {useAuth} from "../auth/auth.context";
import {useContact} from "./contact.context";
import {useNavigate} from "react-router-dom";
import {API_URL, HTTP_PORT} from "../config";


interface ChatContextType {
    channels: any;
    addNewChannel: Function;
    deleteChannel: Function;
    updateChannels: Function;

    setCurrentChannelName: Function;
    currentChannelName: string;
    getCurrentChannelID: Function;
    getCurrentChannelMessages: Function;

    addMessage: Function;
    addPrivateMessage: Function;

    getVisibleChannelAdmins: Function;

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

    const [, setIsError] = useState<any>();

    useEffect(() => {
        const updateChannel = (channel: any) => {
            if (!channel) {
                setCurrentChannelName('general');
                navigate('/channels', {replace: true});
                return;
            }

            let current: any = channels.find((item: any) => item.name === channel.name);

            if (!current) {
                return;
            }

            current.admins = channel.admins;
            current.name = channel.name;
            current.owner = channel.owner;
            current.sanctions = channel.sanctions;
            current.visitors = channel.visitors;
            current.isHasPassword = channel.isHasPassword;

            if (!current.visitors.find((u: any) => u.id === auth.user.id)) {
                navigate('/channels');
            }

            setChannels([...channels]);
        }

        socket.on('channel-info-response', updateChannel);
        return (() => {
            socket.off('channel-info-response')
        })
    }, [channels, socket, auth.user?.id, navigate]);

    useEffect(() => {
        function initChannels(data : any) {
            setPrivateChannels([]);
            setChannels([]);

            setChannels([...data.map((ch : any) : any => {
                let messages : any = sessionStorage.getItem( 'public' + auth.user.id + '\n' + ch.name);
                if (messages) {
                    messages = JSON.parse(messages);
                } else {
                    messages = []
                }
                return ({...ch, messages});
            })]);

            const refreshedPrivateChannels: any[] = [];
            const sessionPrivateMessagesData = sessionStorage.getItem('private' + auth.user.id);
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
            setCurrentChannelName('general');
        }

        if (auth.user) {
            axios.get(`${API_URL}:${HTTP_PORT}/api/channel/all/current/`, {
                method: 'get',
                url: `${API_URL}:${HTTP_PORT}/api/channel/all/current/`,
                responseType: "json",
                headers: {
                    "authorization": 'Bearer ' + auth.user.token,
                },
            })
            .then((response: any) => {
                initChannels(response.data.channels);
            })
            .catch((error: any) => {
                setIsError(true);
            });
        }
    }, [auth.user]);

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
        newChannel.visitors = channel['visitors'];

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


    const addPrivateMessage = useCallback((message : any, toChannelId: number, toChannelName: string) =>
    {
        message = message.message;
        message.id = uuidv4();
        message.toChannelId = toChannelId;
        message.toChannelName = toChannelName;

        if (contact.isBanned({id: +message.userId})) {
            return;
        }

        let current : any = privateChannels.find((ch : any) => ch.id === toChannelId);

        if (current) {
            current.messages = [message, ...current.messages];
            sessionStorage.setItem('private' + auth.user.id, JSON.stringify(current.messages));
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
            sessionStorage.setItem('private' + auth.user.id, JSON.stringify([message]));
            setPrivateChannels([...privateChannels, newChannel]);
        }
    }, [privateChannels, contact, auth]);

    useEffect(() => {
        socket.on("receive_private_message", (message: any) => {
            addPrivateMessage(message, message.message.userId, message.message.username);
        });
        return (()=> {
            socket.off("receive_private_message");
        })
    }, [privateChannels, contact, addPrivateMessage, socket]);


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
            sessionStorage.setItem('public' + auth.user.id + '\n' + message.channel, pack);
            setChannels([...channels]);
        }
    }, [channels, contact, auth]);

    useEffect(() => {
        socket.on("receive_message", addMessage);
        return (()=>{
            socket.off('receive_message');
        })
    }, [addMessage, contact, socket]);

    const deleteChannel = useCallback((name : string) => {
        if (name === currentChannelName) {
            setCurrentChannelName('general');
        }
        setChannels([...channels].filter((ch : any) => ch.name !== name))
        socket.emit("leave_channel", {"name" : name});
    }, [channels, currentChannelName, socket]);

    const deletePrivateChannel = useCallback((name : string) => {
        const sessionPrivateMessagesData = sessionStorage.getItem('private' + auth.user.id);
        if (sessionPrivateMessagesData) {
            try {
                const messages = JSON.parse(sessionPrivateMessagesData);
                sessionStorage.removeItem('private' + auth.user.id);
                sessionStorage.setItem('private' + auth.user.id, JSON.parse(messages.filter((i: any) => i.toChannelName !== name)));
            } catch (e: any) {
            }
        }
        setCurrentChannelName('general');
        setPrivateChannels(privateChannels.filter((ch : any) => ch.name !== name))
    }, [auth, privateChannels]);

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

    let value : ChatContextType = {
        channels,

        addNewChannel,
        deleteChannel,
        updateChannels,

        setCurrentChannelName,
        currentChannelName,
        getCurrentChannelID,
        getCurrentChannelMessages,

        addMessage,
        addPrivateMessage,

        getVisibleChannelAdmins,

        addNewPrivateChannel,
        deletePrivateChannel,
        privateChannels,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
    return React.useContext(ChatContext);
}