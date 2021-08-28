import React from 'react';

class ClassCounter extends React.Component
{
	constructor(props){
		super(props)
		this.state = 
		{
			cnt: 0,

		}
		this.inc = this.inc.bind(this);
		this.dec = this.dec.bind(this);
	}

	inc(){
		this.setState({cnt: this.state.cnt + 1})
	  }
	
	dec(){
		this.setState({cnt: this.state.cnt - 1})
	  }

	render(){ return (
		<div>
			<h3>{this.state.cnt}</h3>
			<button onClick={this.inc}>inc</button>
  		    <button onClick={this.dec}>dec</button>
		</div>
	)}
}

export default ClassCounter;