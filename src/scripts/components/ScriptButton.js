import React, { Component } from 'react';
import store from 'cubbie';
import { ipcRenderer } from 'electron';
import processQueue from '../processQueue';

export default class ScriptButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inProgress: false
    };
    this.cmdName = props.cmdName;
    this.isSilent = props.isSilent;
    this.cmdProcess = null;
    ipcRenderer.send('test', [1, 2, 3]);
  }

  runScript() {
    if (this.state.inProgress)
      return;
    this.setState({ inProgress: true });
    ipcRenderer.send('log', '\n[Running "' + this.cmdName + '" command...]\n');
    ipcRenderer.send('run', { cmdName: this.cmdName, isSilent: this.isSilent });
  }

  killScript() {
    if (!this.state.inProgress)
      return;
    ipcRenderer.send('kill', { cmdName: this.cmdName });
  }

  restartScript() {
    if (!this.state.inProgress)
      return;
    ipcRenderer.send('restart', { cmdName: this.cmdName, isSilent: this.isSilent });
  }

  scriptEnd() {
    ipcRenderer.send('log', '\n["' + this.cmdName + '" command ended]\n');
    this.setState({ inProgress: false });
    store.emit('COMMAND_END', this.cmdName);
  }

  componentDidMount() {
    ipcRenderer.on('killed', (evt, cmdName) => {
      if (cmdName === this.cmdName)
        this.scriptEnd();
    });
    ipcRenderer.on('can-restart', (evt, cmdName) => {
      if (this.cmdName === cmdName)
        this.runScript();
    });
    store.on('COMMAND_START', cmdName => {
      if (cmdName === this.cmdName)
        this.runScript();
    });
    store.on('COMMAND_KILL', cmdName => {
      if (cmdName === this.cmdName)
        this.killScript();
    });
    store.on('COMMAND_RESTART', cmdName => {
      if (cmdName === this.cmdName) {
        this.restartScript();
      }
    });
  }

  render() {
    return (
      <button
      onClick={() => this.runScript()}
      onDoubleClick={() => this.killScript()}
      className={this.state.inProgress ? 'in-progress' : ''}
      data-cmd={this.cmdName}
      >
        {this.cmdName}
        <img className="in-progress" src={this.props.spinnerImg} />
      </button>
    );
  }
}

ScriptButton.propTypes = {
  inProgress: React.PropTypes.bool
};

ScriptButton.defaultProps = {
  inProgress: false
};
