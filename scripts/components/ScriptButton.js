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

var logger = function logger(msg) {
  return _electron.ipcRenderer.send('log', msg);
};

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
    return _this;
  }

  _createClass(ScriptButton, [{
    key: 'runScript',
    value: function runScript() {
      var _this2 = this;

      if (this.state.inProgress) return;

      var cmdName = this.cmdName;

      this.setState({ inProgress: true });

      logger('\n[Running "' + cmdName + '" command...]\n');

      this.cmdProcess = _processQueue2.default.run(cmdName, this.isSilent);

      this.cmdProcess.on('exit', function (code, signal) {
        _this2.scriptEnd();
      });
    }
  }, {
    key: 'killScript',
    value: function killScript() {
      if (!this.state.inProgress) return;
      _processQueue2.default.kill(this.cmdName);
      this.scriptEnd();
    }
  }, {
    key: 'restartScript',
    value: function restartScript() {
      var _this3 = this;

      if (!this.state.inProgress) return;
      process.nextTick(function () {
        _processQueue2.default.kill(_this3.cmdName, function () {
          setTimeout(function () {
            _this3.runScript();
          }, 250);
        });
      });
    }
  }, {
    key: 'scriptEnd',
    value: function scriptEnd() {
      logger('\n["' + this.cmdName + '" command ended]\n');
      this.cmdProcess = null;
      this.setState({ inProgress: false });
      _cubbie2.default.emit('COMMAND_END', this.cmdName);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this4 = this;

      _cubbie2.default.on('COMMAND_START', function (cmdName) {
        if (cmdName === _this4.props.cmdName) _this4.runScript();
      });
      _cubbie2.default.on('COMMAND_KILL', function (cmdName) {
        if (cmdName === _this4.props.cmdName) _this4.killScript();
      });
      _cubbie2.default.on('COMMAND_RESTART', function (cmdName) {
        if (cmdName === _this4.props.cmdName) {
          if (!_this4.state.inProgress) return;
          _this4.restartScript();
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      return _react2.default.createElement(
        'button',
        {
          onClick: function onClick() {
            return _this5.runScript();
          },
          onDoubleClick: function onDoubleClick() {
            return _this5.killScript();
          },
          className: this.state.inProgress ? 'in-progress' : '',
          'data-cmd': this.props.cmdName
        },
        this.props.cmdName,
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