import path from 'path';
import fs from 'fs';
import logger from './terminalLogger';
import _ from 'lodash';
import electron from 'electron';
import remote from 'remote';

const packageJsonPath = path.join(process.cwd(), 'package.json');
const ipcRenderer = electron.ipcRenderer;

function parsePackageJson(configObj, cb) {
	console.log('package path:', packageJsonPath);
	fs.readFile(packageJsonPath, 'utf8', (err, data) => {
		if (err) {
			logger('(package.json error) ' + err);
			ipcRenderer.send('error');
		}

		let jsonData;
		try {
			jsonData = JSON.parse(data);
		}
		catch (e) {
			logger(err);
			ipcRenderer.send('error');
		}

		// set title if not already set
		if (!configObj.name) {
			console.log('name not set');
			configObj.name = jsonData.name;
		}

		if (!jsonData.scripts)
			console.log('No Scripts.'); // add error handler

		configObj.scripts = jsonData.scripts;

		_.keys(configObj.scripts).forEach(key => {
			if (
				!_.includes(configObj.primaryScripts, key) &&
				!_.includes(configObj.excludeScripts, key)
			) {
				configObj.secondaryScripts.push(key);
			} 
		});

		cb(configObj);
	});
}

module.exports = parsePackageJson;
