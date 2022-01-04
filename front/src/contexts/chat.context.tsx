import React, {useEffect, useRef} from "react";
import uuidv4 from "../utils/uuid";
import axios from "axios";
import {useSocketIO} from "./socket.io.context";
import {useAuth} from "../auth/auth.context";
import {useNavigate} from "react-router-dom";

interface ChatContextType {


    initChannels: Function;
    channels: any;
    addNewChannel: Function;
    deleteChannel: Function;

    setCurrentChannel: Function;
    currentChannelName: string;
    getCurrentChannelID: Function;

    addMessage: Function;
    getCurrentChannelMessages: Function;

    getVisibleChannelAdmins: Function;

    onliner: any;
}

const ChatContext = React.createContext<ChatContextType>(null!);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const socket = useSocketIO();
    const auth = useAuth();
    const navigate = useNavigate();

    const [channels, setChannels] = React.useState<any[]>([]);
    const [currentChannelName, setCurrentChannelName] = React.useState<any>(null);

    let onliner : Map<number, boolean> = new Map()

    useEffect(() => {
        setChannels([]);
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
                    e => console.log('Chat roster: ' + e)
                );
        }
    }, [socket, auth.user]);


    const initChannels = (data : any) => {
        setChannels([...(data.map((ch : any) : any => Object.assign({}, ch, {messages: []})))]);
        setCurrentChannelName('general');
    }

    const addNewChannel = (channel: any) => {
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
        new_channel.visitors = channel['visitors']
        let act : any = channels.find((item : any) =>
            item.id === new_channel.id);
        if (act)
            return
        let temp = channels
        temp.push(new_channel)
        setChannels(temp);
    }

    const isEventsInit = useRef(false);
    if (socket.isConnected() && !isEventsInit.current) {
        isEventsInit.current = true;

        socket.on('disconnect', () => {
            navigate('/logout', {replace: true});
        })

        socket.on("receive_message", (message: any) => {
            message = {
                id: uuidv4(),
                ...message.message,
            };
            addMessage(message);
        });

        socket.on("receive_private_message", (message: any) => {
            message = {
                id: uuidv4(),
                ...message.message,
            };
            addPrivateMessage(message)
            console.log("MSG", message)
            
        });
    }

    const addPrivateMessage = (message : any) =>
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
			act = channels.find((item : any) => 
			item.id === -(message.userId));
			if (act)
				act.messages.unshift(message);
		}

		setChannels([...channels]);
	}

    const addMessage = (message : any) => {
        console.log(message)
        let current : any = channels.find((item : any) => item.name === message.channel);
        if (current)
            current.messages.unshift(message);
        setChannels([...channels]); // обновить измененным значение
    }

    const deleteChannel = (name : string) => {
        if (name === currentChannelName)
        {
            if (name === channels[0].name)
                setCurrentChannelName(channels[1].name);
            else
                setCurrentChannelName(channels[0].name);
        }
        setChannels(channels.filter((chan : any) => chan.name !== name));
        socket.emit("leave_channel", {"name" : name});
    }

    const getCurrentChannelID = (): number => {
        let current : any = channels.find((item : any) => item.name === currentChannelName);
        if (!current)
            return 10000000090
        return (current.id);
    }

    const setCurrentChannel = (id: number) => {
        
        let current : any = channels.find((item : any) => +item.id === +id);
    
        if (!current)
            return ;
        setCurrentChannelName(current.name);
    }

    const getCurrentChannelMessages = () => {
        const channel = channels.find((ch: any) => ch.name === currentChannelName)
        return channel.messages;
    }

    const getVisibleChannelAdmins = () : any[] => {
        let current : any = channels.find((item : any) => item.name === currentChannelName);
        if (!current)
            return []
        if (!current.owner)
            return (current.admins)
        return ([...current.admins, current.owner]);
    }

    let value : ChatContextType = {
        initChannels,
        channels,
        addNewChannel,
        deleteChannel,

        setCurrentChannel,
        currentChannelName,
        getCurrentChannelID,

        addMessage,
        getCurrentChannelMessages,

        getVisibleChannelAdmins,

        onliner,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
    return React.useContext(ChatContext);
}