import React from 'react';

function three_msgs(chan_name)
{
	if (chan_name === 'prop1s')
	{
		return (
			[
				{id : 1, chanel: 'prop1s', nick: 'ksilver', msg: 'hello everbody'},
				{id : 2, chanel: 'prop1s', nick: 'dmortal', msg: 'fck off'},
				{id : 3, chanel: 'prop1s', nick: 'smedusa', msg: 'goin out'},
				{id : 4, chanel: 'prop1s', nick: 'smedusa2', msg: 'goi2n out'},
				{id : 1, chanel: 'prop1s', nick: 'ksilver', msg: 'hello everbody'},
				{id : 2, chanel: 'prop1s', nick: 'dmortal', msg: 'fck off'},
				{id : 3, chanel: 'prop1s', nick: 'smedusa', msg: 'goin out'},
				{id : 4, chanel: 'prop1s', nick: 'smedusa2', msg: 'goi2n out'},
				{id : 1, chanel: 'prop1s', nick: 'ksilver', msg: 'hello everbody'},
				{id : 2, chanel: 'prop1s', nick: 'dmortal', msg: 'fck off'},
				{id : 3, chanel: 'prop1s', nick: 'smedusa', msg: 'goin out'},
				{id : 4, chanel: 'prop1s', nick: 'smedusa2', msg: 'goi2n out'},
				{id : 1, chanel: 'prop1s', nick: 'ksilver', msg: 'hello everbody'},
				{id : 2, chanel: 'prop1s', nick: 'dmortal', msg: 'fck off'},
				{id : 3, chanel: 'prop1s', nick: 'smedusa', msg: 'goin out'},
				{id : 4, chanel: 'prop1s', nick: 'smedusa2', msg: 'goi2n out'}
			]
		)
	}
	if (chan_name === 'prop2s')
	{
		return (
			[
				{id : 1, chanel: 'prop2s', nick: 'AAAA', msg: 'aaaa'},
				{id : 2, chanel: 'prop2s', nick: 'BBBB', msg: 'bbbb'},
				{id : 3, chanel: 'prop2s', nick: 'CCCCC', msg: 'cccc'},
				{id : 4, chanel: 'prop2s', nick: 'DDDDD', msg: 'dddd'}
			]
		)
	}
	if (chan_name === 'prop3s')
	{
		return (
			[
				{id : 1, chanel: 'prop3s', nick: '111', msg: 'iiii'},
				{id : 2, chanel: 'prop3s', nick: '222', msg: 'oo ooo '},
				{id : 3, chanel: 'prop3s', nick: '333', msg: 'p p p p '},
				{id : 4, chanel: 'prop3s', nick: '444', msg: 'gf fwqfqf '}
			]
		)
	}

	return ([])
}

export default three_msgs;