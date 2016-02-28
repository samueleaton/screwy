import React, { Component } from 'react';
import store from 'cubbie';

export default class Backdrop extends Component {
	render() {
		return (
			<div id="cover" class="hide"></div>
		);
	}
}
