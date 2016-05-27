'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _cubbie = require('cubbie');

var _cubbie2 = _interopRequireDefault(_cubbie);

var _parseConfig = require('./scripts/parseConfig');

var _parseConfig2 = _interopRequireDefault(_parseConfig);

var _parsePackageJson = require('./scripts/parsePackageJson');

var _parsePackageJson2 = _interopRequireDefault(_parsePackageJson);

var _themeConfig = require('./scripts/themeConfig');

var _themeConfig2 = _interopRequireDefault(_themeConfig);

var _watchConfig = require('./scripts/watchConfig');

var _watchConfig2 = _interopRequireDefault(_watchConfig);

var _Title = require('./scripts/components/Title');

var _Title2 = _interopRequireDefault(_Title);

var _Logo = require('./scripts/components/Logo');

var _Logo2 = _interopRequireDefault(_Logo);

var _PrimaryScripts = require('./scripts/components/PrimaryScripts');

var _PrimaryScripts2 = _interopRequireDefault(_PrimaryScripts);

var _SecondaryScripts = require('./scripts/components/SecondaryScripts');

var _SecondaryScripts2 = _interopRequireDefault(_SecondaryScripts);

var _NpmPackageInstaller = require('./scripts/components/NpmPackageInstaller');

var _NpmPackageInstaller2 = _interopRequireDefault(_NpmPackageInstaller);

var _terminalLogger = require('./scripts/terminalLogger');

var _terminalLogger2 = _interopRequireDefault(_terminalLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// components


(0, _terminalLogger2.default)('from renderer');

var App = function (_Component) {
	_inherits(App, _Component);

	function App() {
		_classCallCheck(this, App);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(App).apply(this, arguments));
	}

	_createClass(App, [{
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'div',
				null,
				_react2.default.createElement(_Title2.default, null),
				_react2.default.createElement(_Logo2.default, null),
				_cubbie2.default.state.primaryScripts.length ? _react2.default.createElement(_PrimaryScripts2.default, null) : null,
				_react2.default.createElement(_SecondaryScripts2.default, null),
				_react2.default.createElement(_NpmPackageInstaller2.default, null)
			);
		}
	}]);

	return App;
}(_react.Component);

_cubbie2.default.on(_cubbie2.default.stateEvents, function () {
	(0, _reactDom.render)(_react2.default.createElement(App, null), document.getElementById('root'));
});

(0, _parseConfig2.default)({}, function (state) {
	(0, _parsePackageJson2.default)(state, function (initialState) {
		(0, _themeConfig2.default)(initialState);
		(0, _watchConfig2.default)(initialState.watchScripts);
		_cubbie2.default.initialState = initialState;
	});
});

window.store = _cubbie2.default;