import React, { Component } from 'react';
import store from 'cubbie';

import ScriptButton from './ScriptButton';

export default class SecondaryScripts extends Component {
	render() {
		return (
			<section id="secondaryScripts">
				{store.state.secondaryScripts.map(script => {
					const isSilent = store.state.silentScripts.some(x => x === script);
					return <ScriptButton key={script} cmdName={script} isSilent={isSilent}
					spinnerImg={store.state.theme.secondarySpinnerPath} />;
				})}
			</section>
		);
	}
}
