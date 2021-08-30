import React, { useState } from 'react';
import './Modal_win.css'

function Modal_window({subject, active, setActive})
{


	return (<div className={active ? 'myModal_active' : 'myModal'}>
		<div className='myModalContent'><h3>{subject}</h3>
		      <button className='ModalBttn' onClick={() => setActive(false)}></button>
		
			<div className='modal_div'>Private</div>
			<div className='modal_div'>Duel</div>
			<div className='modal_div'>Mute</div>
			<div className='modal_div'>Profile</div>
			<div className='modal_div'>Spectrate</div>
			<div className='modal_div'>Something else</div>
		</div>
	</div>)
}

export default Modal_window;