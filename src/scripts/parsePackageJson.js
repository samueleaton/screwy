import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import electron, { remote, ipcRenderer } from 'electron';
const logger = (msg) => ipcRenderer.send('log', msg);

const packageJsonPath = path.join(process.cwd(), 'package.json');

function parsePackageJson(configObj, cb) {
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
		if (!configObj.name)
			configObj.name = jsonData.name;

		if (!jsonData.scripts)
			logger('\nNo scripts found in package.json\n');

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
