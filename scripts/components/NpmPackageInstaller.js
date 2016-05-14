'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _cubbie = require('cubbie');

var _cubbie2 = _interopRequireDefault(_cubbie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NpmPackageInstaller = function (_Component) {
	_inherits(NpmPackageInstaller, _Component);

	function NpmPackageInstaller() {
		_classCallCheck(this, NpmPackageInstaller);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(NpmPackageInstaller).apply(this, arguments));
	}

	_createClass(NpmPackageInstaller, [{
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'section',
				{ id: 'npm-installer', className: 'hide' },
				_react2.default.createElement(
					'form',
					{ id: 'npm-installer-form' },
					_react2.default.createElement(
						'div',
						{ id: 'npm-installer-command-line' },
						_react2.default.createElement(
							'div',
							{ className: 'npm-install' },
							'npm install'
						),
						_react2.default.createElement('input', { id: 'package-name', placeholder: 'package name (optional)' })
					),
					_react2.default.createElement(
						'fieldset',
						{ className: 'radios' },
						_react2.default.createElement(
							'label',
							null,
							'Save',
							_react2.default.createElement('input', { name: 'dependency', value: 'save', type: 'radio' })
						),
						_react2.default.createElement('br', null),
						_react2.default.createElement(
							'label',
							null,
							'Save Dev',
							_react2.default.createElement('input', { name: 'dependency', value: 'save-dev', type: 'radio' })
						),
						_react2.default.createElement('br', null)
					),
					_react2.default.createElement('input', { id: 'npm-installer-submit', type: 'submit', value: 'Run' }),
					_react2.default.createElement('img', { id: 'npm-installer-loader', className: 'loader', src: 'images/loader-white.png' })
				)
			);
		}
	}]);

	return NpmPackageInstaller;
}(_react.Component);

exports.default = NpmPackageInstaller;