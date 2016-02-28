import React, { Component } from 'react';
import store from 'cubbie';

export default class Logo extends Component {
	render() {
		return (
			<img id="npm-logo" src={ store.state.theme.logoPath } />
		);
	}
}
