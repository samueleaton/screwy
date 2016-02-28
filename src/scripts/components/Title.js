import React, { Component } from 'react';
import store from 'cubbie';

export default class Title extends Component {
	render() {
		return (
			<h1 id="title">{store.state.name}</h1>
		);
	}
}
