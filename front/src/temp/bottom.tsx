import React, { useState } from "react";
import { OmniInt } from "./classes/omni"
import ChannelsPanel from "./channels_panel";
import '../styles/bottom.css'
import MessageInput from "./chat_input";
import ModalWindow from "./modal_window";
import FriendsList from "./friends_list";
import Blacklist from "./black_list";
import Profile from "./other_profile";
import Loading from "./network/axios_loading";
import Preferences from "./preferences";


import  { io } from "socket.io-client";

function Bottom({Omni} : OmniInt)
{
	if (Omni.ChannelsList.token !== Omni.Account.getToken() ||
		Omni.FriendsList.token !== Omni.Account.getToken())
	{
		Omni.ChannelsList.token = Omni.Account.getToken()
		Omni.FriendsList.token = Omni.Account.getToken()
		Omni.ChannelsList.socket.disconnect();
		Omni.ChannelsList.setSocket(io("http://localhost:3002", {
		extraHeaders:
		{
			Authorization : Omni.Account.getToken()}}
		));
	}
	const [actScreen, setActScreen] = useState('channels')

	Loading(Omni.FriendsList, 'first');
	//Home(Omni.ChannelsList, 'first');
	Omni.setActScreen = setActScreen;
	Omni.ActScreen = actScreen;
	Loading(Omni.Account, 'profile');


	if (actScreen === 'channels')
	{
		return (
			<div>
				<ChannelsPanel Omni={Omni} />
			</div>
		)
	}
	else if (actScreen === 'chat_field')
	{
		return (
			<div>
				<ModalWindow Omni={Omni} />
				<MessageInput Omni={Omni} />
			</div>
		)
	}
	else if (actScreen === 'profile')
	{
		return (
			<Profile Omni={Omni}/>
		)
	}
	else if (actScreen === 'contacts')
	{
		return (<div>
			<FriendsList Omni={Omni} />
			<Blacklist Omni={Omni} />
		</div>)
	}
	else if (actScreen === 'settings')
	{
		return (<div>
			<Preferences Omni={Omni} />
		</div>)
	}
	else if (actScreen === 'game')
	{
		return (<div>
			{/*<Game Omni={Omni} />*/}
		</div>)
	}
	return (<div></div>)
}

export default Bottom;