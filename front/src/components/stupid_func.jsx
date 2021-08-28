import React, { useState } from 'react';
import "../styles/App.css";
import Option_window from './option_window';


import Chanel_names from '../delete_temp';
import three_msgs from '../delete_temp2';

function Stupid_func()
{
	const [chanels, setChanel] = useState(Chanel_names)
	const [act_achen, actChanel] = useState(chanels[0].title)
	const [option_window, setOptionw] = useState({name: 'act_achen', type: 'chat'})

	function change_chanel(name)
	{
		actChanel(name)
		addMassages(three_msgs(name))
		Chat_Msgs()
	}

	function Chanel_button(name)
	{

		if (act_achen === name.name.title)
			return (
				<td bgcolor='white'>
					<font color='black'>{name.name.title}
					</font></td>
			)

		return (
			<td className='td' bgcolor='black' onClick={() => change_chanel(name.name.title)}>
			<font color='white'>
				{name.name.title}
				</font></td>
		)
	}

	



	function Single_msg(props)
	{
		return (
			<div style={{margin: '7px'}}>
			<div><i>{props.msg.nick}</i>	
				</div>{props.msg.msg}</div>
			)
	}
	const [massages, addMassages] = useState(three_msgs(act_achen))
	
	function Chat_Msgs()
	{
		return (
		<div className="div-chat">
				{massages.map(msg => <Single_msg msg={msg} key={msg.id}/>)}
		</div>
		)
	}

	function add_new_msg(value){
		
		
		const newone = 
			{id : Date.now(), chanel: 'prop1s', nick: 'NICK', msg: value}
		
		addMassages([newone, ...massages])
	
	}

	function Add_input_table()
	{
		return (
			<input
			onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?
				add_new_msg(e.target.value) : 0}
			type='text' size='85'></input>
		)
	}

	function Add_table_func()
	{
		return (
			<table bgcolor='white' cellspacing="1" cellpadding="0">
			  <tr>
				{chanels.map(chan => <Chanel_button name={chan} key={chan.id}/>)}
				  <td width='100%'></td>
			  </tr></table>
		)
	}

	return (
	<table width='100%' height='300' cellspacing="0" cellpadding="0" bgcolor='white'>
		<tr><td width='40%' bgcolor='green'><Chat_Msgs/><Add_input_table/></td>
		<td><Option_window obj={option_window}/></td>
		<td bgcolor='black' width='25%'>
			<font color='white'>nick, stats, name, guilb, ava</font></td>
		</tr>
		
		<tr>
		<td valign='bottom'	bgcolor='red'>
		
		
		<Add_table_func/>
		</td>
		</tr>
	 </table>
	)
}

export default Stupid_func;