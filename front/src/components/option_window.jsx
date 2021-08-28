import React from 'react';

import "../styles/App.css";

function Option_window(obj)
	{
		return (
			<table width='100%' height='100%' cellspacing="0" cellpadding="0" ><tr>
				<td colSpan='4' height='10%' align='center'>Shapka</td></tr><tr>
				<td align='center' width='25%'>{obj.obj.type}</td>
				<td align='center' width='25%' bgcolor='grey' >2</td>
				<td align='center' width='25%'>3</td>
				<td align='center' width='25%' bgcolor='grey'>3</td>
			</tr><tr>
			<td bgcolor='red' width='25%' align='center'>4</td>
			<td align='center' width='25%'>5</td>
			<td bgcolor='red' width='25%' align='center'>6</td>
			<td align='center' width='25%'>3</td>
			</tr></table>
		)
	}

export default Option_window;