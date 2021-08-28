import React, { useState } from 'react';
import "../styles/App.css";
import Chanel_names from '../delete_temp';
import three_msgs from '../delete_temp2';



function Stupid_func()
{
	const [chanels, setChanel] = useState(Chanel_names)
	const [act_achen, actChanel] = useState(chanels[0].title)

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
				<div >
				<select size='1' style={{background:'grey'}}>
				<option>{props.msg.nick}</option>
				<option>Private message --on work</option>
				<option>Duel --on work</option>
				<option>Invite to guild --on work</option>
				<option>Mute --on work</option>
				</select>
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
			<table bgcolor='white' cellspacing="1" cellpadding="0">
			<tr><td><input
			onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?
				add_new_msg(e.target.value) : 0}
			type='text' size='100'></input></td>
			
			<td>
				<button>R</button></td>
				<td>	<button>E</button></td>
				<td>	<button>S</button></td>
				<td>	<button>E</button></td>
				<td>	<button>R</button></td>
				<td>	<button>V</button></td>
				<td>	<button>E</button></td>
				<td>	<button>D</button>
				</td>
			  </tr></table>
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
		<tr><td width='40%' bgcolor='green'><Chat_Msgs/></td><td bgcolor='blue' width='150px'>
			<div>1</div>
			<div>2</div>
			<div>3</div>
			<div>4</div>
			<div>5</div>
			<div>6</div>

			
			</td>
			<td bgcolor='black' rowSpan='2'> <font color='white'>nick, stats, name, guilb, ava</font></td>
			</tr><tr>
		<td valign='bottom'	bgcolor='red' colSpan='2'>
		
		<Add_input_table/>
		<Add_table_func/>
		</td>
		</tr>
	 </table>
	)
}

export default Stupid_func;