import React, { useState } from 'react';

function Counter()
{
	const [cnt, setCnt] = useState(0);

	function inc(){
		setCnt(cnt + 1); 
	  }
	
	  function dec(){
		setCnt(cnt - 1);
	  }

	return (
		<div>
			<h3>{cnt}</h3>
			<button onClick={inc}>inc</button>
  		    <button onClick={dec}>dec</button>
		</div>
	)
}

export default Counter;