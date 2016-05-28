'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _cubbie = require('cubbie');

var _cubbie2 = _interopRequireDefault(_cubbie);

var _electron = require('electron');

var _processQueue = require('../processQueue');

var _processQueue2 = _interopRequireDefault(_processQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScriptButton = function (_Component) {
  _inherits(ScriptButton, _Component);

  function ScriptButton(props) {
    _classCallCheck(this, ScriptButton);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ScriptButton).call(this, props));

    _this.state = {
      inProgress: false
    };
    _this.cmdName = props.cmdName;
    _this.isSilent = props.isSilent;
    _this.cmdProcess = null;
    _electron.ipcRenderer.send('test', [1, 2, 3]);
    return _this;
  }

  _createClass(ScriptButton, [{
    key: 'runScript',
    value: function runScript() {
      if (this.state.inProgress) return;
      this.setState({ inProgress: true });
      _electron.ipcRenderer.send('log', '\n[Running "' + this.cmdName + '" command...]\n');
      _electron.ipcRenderer.send('run', { cmdName: this.cmdName, isSilent: this.isSilent });
    }
  }, {
    key: 'killScript',
    value: function killScript() {
      if (!this.state.inProgress) return;
      _electron.ipcRenderer.send('kill', { cmdName: this.cmdName });
    }
  }, {
    key: 'restartScript',
    value: function restartScript() {
      if (!this.state.inProgress) return;
      _electron.ipcRenderer.send('restart', { cmdName: this.cmdName, isSilent: this.isSilent });
    }
  }, {
    key: 'scriptEnd',
    value: function scriptEnd() {
      _electron.ipcRenderer.send('log', '\n["' + this.cmdName + '" command ended]\n');
      this.setState({ inProgress: false });
      _cubbie2.default.emit('COMMAND_END', this.cmdName);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      _electron.ipcRenderer.on('killed', function (evt, cmdName) {
        if (cmdName === _this2.cmdName) _this2.scriptEnd();
      });
      _electron.ipcRenderer.on('can-restart', function (evt, cmdName) {
        if (_this2.cmdName === cmdName) _this2.runScript();
      });
      _cubbie2.default.on('COMMAND_START', function (cmdName) {
        if (cmdName === _this2.cmdName) _this2.runScript();
      });
      _cubbie2.default.on('COMMAND_KILL', function (cmdName) {
        if (cmdName === _this2.cmdName) _this2.killScript();
      });
      _cubbie2.default.on('COMMAND_RESTART', function (cmdName) {
        if (cmdName === _this2.cmdName) {
          _this2.restartScript();
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        'button',
        {
          onClick: function onClick() {
            return _this3.runScript();
          },
          onDoubleClick: function onDoubleClick() {
            return _this3.killScript();
          },
          className: this.state.inProgress ? 'in-progress' : '',
          'data-cmd': this.cmdName
        },
        this.cmdName,
        _react2.default.createElement('img', { className: 'in-progress', src: this.props.spinnerImg })
      );
    }
  }]);

  return ScriptButton;
}(_react.Component);

exports.default = ScriptButton;


ScriptButton.propTypes = {
  inProgress: _react2.default.PropTypes.bool
};

ScriptButton.defaultProps = {
  inProgress: false
};