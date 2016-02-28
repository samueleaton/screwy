import React, { Component } from 'react';
import store from 'cubbie';
import logger from '../terminalLogger';
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
  }

  runScript() {
    if (this.state.inProgress)
      return;

    const cmdName = this.cmdName;
  
    this.setState({ inProgress: true });

    logger('\n[Running "' + cmdName + '" command...]\n');

    this.cmdProcess = processQueue.run(cmdName, this.isSilent);

    this.cmdProcess.on('exit', (code, signal) => {
      this.scriptEnd();
    });
  }

  killScript() {
    if (!this.state.inProgress)
      return;
    processQueue.kill(this.cmdName);
    this.scriptEnd();
  }

  restartScript() {
    if (!this.state.inProgress)
      return;
    process.nextTick(() => {
      processQueue.kill(this.cmdName, () => {
        setTimeout(() => {
          this.runScript();
        }, 250);
      });
    });
  }

  scriptEnd() {
    logger('\n["' + this.cmdName + '" command ended]\n');
    this.cmdProcess = null;
    this.setState({ inProgress: false });
  }

  componentDidMount() {
    store.on('COMMAND_START', cmdName => {
      if (cmdName === this.props.cmdName)
        this.runScript();
    });
    store.on('COMMAND_KILL', cmdName => {
      if (cmdName === this.props.cmdName)
        this.killScript();
    });
    store.on('COMMAND_RESTART', cmdName => {
      if (cmdName === this.props.cmdName) {
        if (!this.state.inProgress)
          return;
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
      data-cmd={this.props.cmdName}
      >
        {this.props.cmdName}
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
