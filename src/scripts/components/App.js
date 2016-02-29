import React, { Component } from 'react';
import { render } from 'react-dom';
import store from 'cubbie';
import parseConfig from './scripts/parseConfig';
import parsePackageJson from './scripts/parsePackageJson';
import themeConfig from './scripts/themeConfig';
import watchConfig from './scripts/watchConfig';

// components
import Title from './scripts/components/Title';
import Logo from './scripts/components/Logo';
import PrimaryScripts from './scripts/components/PrimaryScripts';
import SecondaryScripts from './scripts/components/SecondaryScripts';
import NpmPackageInstaller from './scripts/components/NpmPackageInstaller';


class App extends Component {
	render() {
		return (
			<div>
				<Title />
				<Logo />
				{ store.state.primaryScripts.length ? <PrimaryScripts /> : null }
				<SecondaryScripts />
				<NpmPackageInstaller />
			</div>
		);
	}
}

store.on(store.stateEvents, () => {
	render(<App />, document.getElementById('root'));
});

parseConfig({}, state => {
	parsePackageJson(state, initialState => {
		themeConfig(initialState);
		watchConfig(initialState.watchScripts);
		store.initialState = initialState;
	});
});

window.store = store;
