import React, { Component } from 'react';
import store from 'cubbie';

import ScriptButton from './ScriptButton';

export default class PrimaryScripts extends Component {
	render() {
		return (
			<section id="primaryScripts">
				{store.state.primaryScripts.map(script => {
					const isSilent = store.state.silentScripts.some(x => x === script);
					return (
						<ScriptButton key={script} cmdName={script} isSilent={isSilent}
						spinnerImg={store.state.theme.primarySpinnerPath} />
					);
				})}
			</section>
		);
	}
}
