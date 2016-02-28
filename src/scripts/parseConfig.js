'use strict';

import path from 'path';
import fs from 'fs';
import electron from 'electron';
import remote from 'remote';
import logger from './terminalLogger';
import _ from 'lodash';

const app = remote.app;
const configPath = app.configPath;

function parseConfig(configObj, cb) {
	configObj.name = null;
	configObj.primaryScripts = [];
	configObj.secondaryScripts = [];
	configObj.excludeScripts = [];
	configObj.silentScripts = [];
	configObj.fontStack = null;
	configObj.scripts = null;
	configObj.theme = {
		name: null,
		primarySpinnerPath: null,
		secondarySpinnerPath: null,
		logoPath: null
	};

	console.log('configPath: ', configPath);
	fs.readFile(configPath, 'utf8', (err, data) => {
		if (err) {
			logger('no .nsgrc found');
			return cb(configObj);
		}

		let jsonData;
		try {
			jsonData = JSON.parse(data);
		}
		catch (e) {
			jsonData = {};
		}

		if (jsonData.name) 
			configObj.name = jsonData.name;

		if (jsonData.theme) 
			configObj.theme.name = jsonData.theme || 'light';

		if (configObj.theme.name !== 'light' && configObj.theme.name !== 'dark')
			configObj.theme.name = 'light';

		// get primary commands from the .nsgrc file
		if (_.isArray(jsonData.primary))
			configObj.primaryScripts = jsonData.primary;

		// get commands to exclude from the .nsgrc file
		if (_.isArray(jsonData.exclude))
			configObj.excludeScripts = jsonData.exclude;

		// get commands that run silently
		if (_.isArray(jsonData.silent))
			configObj.silentScripts = jsonData.silent;

		// get font-stack from the .nsgrc file
		if (_.isArray(jsonData.fontStack))
			configObj.fontStack = jsonData.fontStack;

		if (typeof jsonData.watch === 'object')
			configObj.watchScripts = jsonData.watch;

		cb(configObj);

	});
}

module.exports = parseConfig;
