import React, { useState } from 'react';
import "./New_chanel.css"

function New_chanel_win({visible, setVisible, chanels, setChanels})
{

	const [hihoh, setH] = useState('hm')

	function add_new_chan(value)
	{
		const new_chan = {
			id: Date.now(),
			title: value,
			body: 'no body'
		}
		setChanels([...chanels, new_chan])
		setVisible(false)
	}

	return (<div className={visible ? 'NC_active' : 'myModal'}>
	<div className='NC_Content'><h3>Create new chanel</h3>
		  <button className='ModalBttn' onClick={() => setVisible(false)}></button>
		  <div>
			  <input
			  onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?
			  add_new_chan(e.target.value) : 0}></input>
			 
		  </div>
	</div>
</div>
	)
}

export default New_chanel_win;