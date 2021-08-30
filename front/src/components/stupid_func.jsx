import React, { useState } from 'react';
import "../styles/App.css";
import Modal_window from './modal_window/modal_window';
import New_chanel_win from './modal_window/New_chanel';

import Chanel_names from '../delete_temp';
import three_msgs from '../delete_temp2';

function Stupid_func()
{
	const [chanels, setChanel] = useState(Chanel_names)
	const [act_achen, actChanel] = useState(chanels[0].title)
	const [option_window, setOptionw] = useState({name: 'act_achen', type: 'chat'})
	
	const [modal_win, setModal_win] = useState(false)

	function change_chanel(name)
	{
		actChanel(name)
		addMassages(three_msgs(name))
		Chat_Msgs()
	}
	

	function del_chanel(title)
	{	
		if (title === act_achen)
		{
			if (chanels.length === 1)
				return
			if (title === chanels[0].title)
				change_chanel(chanels[1].title)
			else
				change_chanel(chanels[0].title)
		}

		setChanel(chanels.filter(chan => chan.title !== title))
	}

	function Chanel_button(name)
	{
		if (act_achen === name.name.title)
			return (
				<td bgcolor='white'><div className='td_div_chat_item'>
					<div className='td_div_chat_item_left'>
					<font color='black' >
						{name.name.title}
					 </font> </div>  <button onClick={() => del_chanel(name.name.title)} className="chanButtn">
					</button></div></td>
			)

		return (
			<td bgcolor='black'><div className='td_div_chat_item'>
			<div className='td_div_chat_item_left' onClick={() => change_chanel(name.name.title)}>
				<font color='white'>
				{name.name.title}    
				</font></div> <button className="chanButtn" 
				onClick={() => del_chanel(name.name.title)}></button>
			</div>
			   </td>
		)
	}

	const [modal_subject, setModalsubject] = useState('some nick')

	function openMod(nick)
	{
		setModalsubject(nick)
		setModal_win(true)
	}

	function Single_msg(props)
	{
		return (
			<div style={{margin: '7px'}}>
			<div onClick={() => openMod(props.msg.nick)}><i>{props.msg.nick}</i>	
				</div>{props.msg.msg}</div>
			)
	}
	const [massages, addMassages] = useState(three_msgs(act_achen))
	
	function Chat_Msgs()
	{
		return (
		<div className="div-chat">
				{massages.map(msg => <Single_msg msg={msg} key={msg.id}/>)}
				<Modal_window subject={modal_subject} active={modal_win} setActive={setModal_win}/>
		</div>
		)
	}

	function add_new_msg(value){
		
		
		const newone = 
			{id : Date.now(), chanel: 'prop1s', nick: 'NICK', msg: value}
		
		addMassages([newone, ...massages])
	
	}

	const [nc_window, setNC_win] = useState(false)

	function open_new_ch()
	{
		setNC_win(true)
	}

	function Add_input_table()
	{
		return (
			<div>
			<input
			onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?
				add_new_msg(e.target.value) : 0}
			type='text' size='85'></input><button className='new_chanel_button' onClick={() => open_new_ch()}> New chanel</button>
			<New_chanel_win 
				visible={nc_window} setVisible={setNC_win}
				chanels={chanels} setChanels={setChanel}/></div>
		)
	}

	function Add_table_func()
	{
		return (
			<table bgcolor='white' cellspacing="1" cellpadding="0">
			  <tr>
				{chanels.map(chan => <Chanel_button name={chan} key={chan.id}/>)}
				  
			  </tr></table>
		)
	}

	return (
	<table width='100%' height='300' cellspacing="0" cellpadding="0" bgcolor='white'>
		<tr><td width='40%' bgcolor='green'><Chat_Msgs/><Add_input_table/></td>
		<td width='30%' height='100%'>
			
		</td>
		<td bgcolor='black' width='25%'>
			<font color='white'>nick, stats, name, guilb, ava</font></td>
		</tr>
		
		<tr>
		<td>
			<div className='td_chat_list'>
		<Add_table_func/>
		</div>
		</td>
		</tr>
	 </table>
	)
}

export default Stupid_func;