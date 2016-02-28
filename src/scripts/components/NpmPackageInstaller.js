import React, { Component } from 'react';
import store from 'cubbie';

export default class NpmPackageInstaller extends Component {
	render() {
		return (
			<section id="npm-installer" className="hide">
				<form id="npm-installer-form">
					<div id="npm-installer-command-line">
						<div className="npm-install">npm install</div>
						<input id="package-name" placeholder="package name (optional)" />
					</div>
					<fieldset className="radios">
						<label>Save<input name="dependency" value="save" type="radio" /></label><br />
						<label>Save Dev<input name="dependency" value="save-dev" type="radio" /></label><br />
					</fieldset>
					<input id="npm-installer-submit" type="submit" value="Run" />
					<img id="npm-installer-loader" className="loader" src="images/loader-white.png" />
				</form>
			</section>
		);
	}
}
