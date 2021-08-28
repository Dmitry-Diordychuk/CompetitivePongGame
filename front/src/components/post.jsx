import React from 'react';

function Post(props){

return (
	<div className='post'>
			<div className='post__content'>
			<strong> -{props.item.title}- </strong>
				<div>
				{props.item.body}
				</div>
			</div>
			<div className='post__btns'>
				<button>delddete</button> 
			</div>
	</div>
	)
}

export default Post;