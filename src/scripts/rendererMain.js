'use strict';

const path = require('path');
const fs = require('fs');

const scriptsDir = path.join(__dirname, 'scripts');
const remote = require('remote');
const app = remote.require('app');
const ipcRenderer = require('electron').ipcRenderer;

const dom = require(path.join(scriptsDir, 'dom'));
const childProcess = require('child_process');
const spawn = childProcess.spawn;
const fang = require('fangs');
const rand = require(path.join(scriptsDir, 'rand'));

const projPath = process.cwd();
const packageJsonPath = path.join(projPath, 'package.json');
const primaryScriptsCont = dom('primaryScripts');
const secondaryScriptsCont = dom('secondaryScripts');
let primaryCommands = {};
let excludedCommands = {};

const theme = require(path.join(scriptsDir, 'theme'));
window.processQueue = require(path.join(scriptsDir, 'processQueue'));

function toArr(list) {
	const arr = [];
	if (!list.hasOwnProperty(length)) {
		arr.push(list);
		return arr;
	}
	for (let i = 0, ii = list.length; i < ii; i++) {
		arr.push(list[i]);
	}
	return arr;
}

fang(
	// read .nsgrc config file
	next => {
		fs.readFile(app.config, 'utf8', (err, data) => {
			if (err) {
				logger('no .nsgrc found');
				theme.set();
				return next();
			}

			let jsonData;
			try {
				jsonData = JSON.parse(data);
			}
			catch (e) {
				jsonData = {};
			}

			// set title
			if (jsonData.name) dom('title').text(jsonData.name).addClass('hasTitle');

			// get primary commands from the .nsgrc file
			if (Array.isArray(jsonData.primary)) {
				jsonData.primary.forEach(cmd => {
					primaryCommands[cmd] = true;
				});
			}

			// get commands to exclude from the .nsgrc file
			if (Array.isArray(jsonData.exclude)) {
				jsonData.exclude.forEach(cmd => {
					excludedCommands[cmd] = true;
				});
			}

			// get font-stack from the .nsgrc file
			if (Array.isArray(jsonData['font-stack'])) {
				let customCSS = "body { font-family: ";
				jsonData['font-stack'].forEach(font => {
					customCSS += "'" + font + "', "
				});
				customCSS = customCSS.slice(0, -2) + ';}';
				
				dom('user-styles').text(customCSS);
			}

			theme.set(jsonData.theme);

			return next();
		});
	},

	next => {
		// read package.json file
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
			if (!dom('title').hasClass('hasTitle'))
				dom('title').text(jsonData.name).addClass('hasTitle');;

			Object.keys(jsonData.scripts).forEach(cmdName => {
				// if this command is to be excluded, do nothing
				if (excludedCommands[cmdName]) return;

				let btn = dom.create('button').text(cmdName).attr('data-cmd', cmdName);

				// add the btn `click` handler	
				btn.listen('click', e => {
					if (btn.classList.contains('in-progress'))
						return;
					console.log('CLICKED');
					runCommand(btn, btn.dataset.cmd);
				});

				btn.listen('dblclick', e => {
					if (btn.classList.contains('in-progress'))
						process.nextTick(
							() => processQueue.kill(btn.dataset.cmd)
						);
				});

				// does button have primary or normal status
				if (primaryCommands[cmdName])
					primaryScriptsCont.appendChild(btn.attr('data-primary', 'true'));
				else
					secondaryScriptsCont.appendChild(btn);
			});

			// if no primary commands are found, remove the container
			if (Object.keys(primaryCommands).length === 0)
				dom.remove(primaryScriptsCont);
		});
	}
)();


function logger(message) {
	const logSpawn = spawn('echo', [message], {
		cwd: projPath,
		stdio: 'inherit'
	});

	logSpawn.on('exit', function(error) {
		logSpawn.kill();
	});
}

process.on('uncaughtException', function(e) {
	logger(e);
});

function runCommand(btn, cmdName) {
	btn.classList.add('in-progress');
	logger('\n[Running "' + cmdName + '" command...]\n');

	if (btn.dataset.primary === 'true')
		var spinnerImgFile = path.join('images', theme.getPrimaryLoader());
	else
		var spinnerImgFile = path.join('images', theme.getLoader());

	const spinnerImg = dom.create('img').addClass('in-progress')
		.attr('src', spinnerImgFile);

	btn.append(spinnerImg);

	let cmd = processQueue.run(cmdName);

	cmd.on('exit', function(code, signal) {
		btn.classList.remove('in-progress');
		logger('\n["' + cmdName + '" command ended]\n');
		dom.remove(spinnerImg);
	});
}


function appQuitting() {
	processQueue.killAll(() => ipcRenderer.send('can-quit'));
}

// == npm installer ==
const npmInstaller = (function() {
	let active = false;

	const section = document.getElementById('npm-installer');
	const form = document.getElementById('npm-installer-form');
	const packageNameField = document.getElementById('package-name');
	const radios = toArr(document.querySelectorAll('input[type=radio]'));
	const cover = document.getElementById('cover');

	function toggle() {
		active ? hide() : show() ;
	}

	function hide() {
		if (active === false) return;
		active = false;
		section.classList.add('hide');
		cover.classList.add('hide');
		radios.forEach(r => {
			r.checked = false;
			r.blur();
		});
		packageNameField.value = '';
		packageNameField.blur();
	}

	function show() {
		if (active === true) return;
		active = true;
		section.classList.remove('hide');
		cover.classList.remove('hide');
		setTimeout(() => packageNameField.focus(), 300);
	}

	function getPackageName() {
		return packageNameField.value.trim();
	}

	function getCheckedRadio() {
		const checkedRadio = radios.find(r => r.checked);
		// returns 'undefined', '--save' or '--save-dev'
		return checkedRadio && (checkedRadio.value === 'save' ? '--save' : '-save-dev' );
	}

	function installerError() {
		section.classList.add('error');
		setTimeout(() => {section.classList.remove('error')}, 400);
	}

	function run() {
		const packName = getPackageName();
		const checkedRadio = getCheckedRadio();

		let commandString = 'npm install';
		if (packName.length) commandString += ' ' + packName;
		if (checkedRadio) commandString += ' ' + checkedRadio;

		logger('\n[Running "' + commandString + '"...]\n');

		let cmd = processQueue.install({
			id: rand(12),
			package: packName,
			depType: checkedRadio
		});

		cmd.on('exit', function(code, signal) {
			logger('\n["' + commandString + '" ended]\n');
			if (code === 0) hide();
			else installerError();
		});
	}

	form.addEventListener('submit', evt => {
		evt.preventDefault();
		run();
	});

	return {toggle};
})();
