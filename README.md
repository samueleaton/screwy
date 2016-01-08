<br>  
<br>  
<p align="center">
<img width="350" src="https://raw.githubusercontent.com/samueleaton/design/master/npm-scripts-black.png">    
</p>
<br>  
<br>  

# npm scripts gui (NSG)  
A ~~GUI~~ gooey interface for npm scripts.

[![GitHub version](https://badge.fury.io/gh/samueleaton%2Fnpm-scripts-gui.svg)](https://badge.fury.io/gh/samueleaton%2Fnpm-scripts-gui) [![npm version](https://badge.fury.io/js/npm-scripts-gui.svg)](https://badge.fury.io/js/npm-scripts-gui) <img src="https://img.shields.io/badge/license-MIT-blue.svg">

<br>
<p align="center">
<img height="250" src="https://raw.githubusercontent.com/samueleaton/design/master/npmsg.png">  
</p>
<br>

*Tested on OS X Yosemite and El Capitan*

## Install  

Install as a Dev Dependency  
```
npm i -D npm-scripts-gui
```

...Or Install Globally  
```
npm i -g npm-scripts-gui
```

Installing as a dev dependency allows anyone who downloads your project to also get access to the gui... for free!

## Instructions  

#### Launching

To launch Npm Script GUI (NSG), you must be in a directory with a ` package.json ` file.   

**If Installed Globally**

Then simply run:  
` npm-script-gui ` or the shorter ` nsg `

**If Installed as a Dev Dependency (Recommended)**

You must create an npm script task in the ` package.json ` that runs the ` nsg ` command and then you would run ` npm run <command_name> ` from the terminal. 

```json
{
    "scripts": {
        "nsg": "nsg"
    }
}
```

<br>


#### Seeing Output  

Whether NSG is installed globally or as a dependency, any text output associated with any npm script task will be printed to the command line where NSG was launched. 

<p align="center">
<img width="400" src="https://raw.githubusercontent.com/samueleaton/design/master/nsg.gif">  
</p>
<br>


#### Quiting the App  

To **quit** the app, it is safer to close the actual renderer window rather than quiting the process from the command line. If quiting from the command line, NSG may not do the check to make sure all processes are killed before closing. 

#### On Stopping a Running Script   

Processes will die automatically when they finish or when the app is closed, but there may be times when you want to manually kill a process. Simply **double click the button**. 

## Configurations  

NSG will automatically search for a ` .nsgrc ` in the same directory as the ` package.json `. It should be in json format.

These are the available options:
- **name**, choose different name than defined in ` package.json `
- **primary**, the primary script buttons for scripts that will be ran more frequently
- **exclude**, scripts to NOT include in the GUI
- **alwaysOnTop**, whether the window is always in front of other windows
- **font-stack**, the fonts in the GUI
- **theme**, choose a light or dark theme for window
- **hotkeys**, define hotkey combinations that will trigger npm scripts

**.nsgrc Example**  

```
{
    "name": "Qualtrics to SFDC",
    "primary": ["build", "run-production", "run-sandbox"],
    "exclude": ["scripts-gui", "prebuild"],
    "alwaysOnTop": true,
    "font-stack": ["source code pro", "menlo", "helvetica neue"],
    "theme": "dark",
    "hotkeys": {
        "build": "Control+Alt+b",
        "run-production": "Shift+Command+1",
        "run-sandbox": "Shift+Command+2"
    }
}
```

Any script not specified in ` primary ` or ` exclude ` will show up as a normal button.

## Hotkeys  

Hotkey combinations are configurable in the ` .nsgrc ` file. These allow you to trigger any npm scripts without needing to even click on the button or even being focused on the GUI window. 

Again, you can have the GUI window minimized and the hotkeys will still trigger button clicks, and output will be sent to the terminal.

Hotkeys are defined in the ` .nsgrc ` file. They require the name of the npm script as the key and the hotkey combination as the value. Hotkey examples are in the Configurations section.

## Npm Package Installer

<br>
<p align="center">
<img height="250" src="https://raw.githubusercontent.com/samueleaton/design/master/npmsg2.png">     
</p>
<br> 

This feature was added to keep you from needing to open an extra terminal tab just to run `npm install <package>`. Hit `cmd+i` (or select 'npm installer' from the menu bar) to open the npm installer.

You can run:  
- ` npm install `
- ` npm install <package> `
- ` npm install --save <package> `
- ` npm install --save-dev <package> `

Just like with the npm scripts buttons, output for the npm package installer will be rendered in the terminal where NSG was launched.  

If there is a non-zero return code (aka an error code) for the ` npm install ` then the Npm Package installer will flash red--you should also see errors in the terminal. 

### Future Configuration Plans:  
- ability to sort scripts (e.g. alphabetically)
- create custom commands not in package.json (specific to gui)
- run npm scripts in silent mode (good for linting tasks)

