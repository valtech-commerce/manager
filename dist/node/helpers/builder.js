"use strict";

exports.default = void 0;

var _babelPluginAddModuleExports = _interopRequireDefault(require("babel-plugin-add-module-exports"));

var _copyWebpackPlugin = _interopRequireDefault(require("copy-webpack-plugin"));

var _disableOutputWebpackPlugin = _interopRequireDefault(require("disable-output-webpack-plugin"));

var _figures = _interopRequireDefault(require("figures"));

var _friendlyErrorsWebpackPlugin = _interopRequireDefault(require("friendly-errors-webpack-plugin"));

var _path = _interopRequireDefault(require("path"));

var _webpack = _interopRequireDefault(require("webpack"));

var _webpackMerge = _interopRequireDefault(require("webpack-merge"));

var _fss = _interopRequireDefault(require("@absolunet/fss"));

var _terminal = require("@absolunet/terminal");

var _core = require("@babel/core");

var _pluginTransformModulesCommonjs = _interopRequireDefault(require("@babel/plugin-transform-modules-commonjs"));

var _paths = _interopRequireDefault(require("./paths"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Builder
//--------------------------------------------------------
//-- Common
const COMMON_CONFIG = {
  mode: 'none',
  devtool: ''
}; //-- Node.js

const NODE_CONFIG = (0, _webpackMerge.default)(COMMON_CONFIG, {
  target: 'node',
  entry: `${_paths.default.webpackEntryPoints}/node.js`,
  plugins: [new _disableOutputWebpackPlugin.default(), new _copyWebpackPlugin.default([{
    context: _paths.default.package.sources,
    from: '**/*.js',
    to: '',
    cache: true,
    transform: content => {
      return (0, _core.transformAsync)(content, {
        plugins: [[_pluginTransformModulesCommonjs.default, {
          strict: true
        }], [_babelPluginAddModuleExports.default, {
          addDefaultProperty: true
        }]]
      }).then(({
        code
      }) => {
        return code;
      });
    }
  }])]
}); //-- Browser

const BROWSER_CONFIG = (0, _webpackMerge.default)(COMMON_CONFIG, {
  target: 'web',
  entry: `${_paths.default.webpackEntryPoints}/browser.js`,
  output: {
    filename: 'browser.js'
  }
}); //-- Browser ES5

const BROWSER_ES5_CONFIG = (0, _webpackMerge.default)(BROWSER_CONFIG, {
  output: {
    filename: 'browser-es5.js'
  },
  module: {
    rules: [{
      test: /\.js$/u,
      exclude: /node_modules/u,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/env', {
            targets: '> 0.25%, not dead',
            useBuiltIns: 'usage',
            corejs: '3'
          }]]
        }
      }
    }]
  }
}); //-- kafe

const KAFE_CONFIG = (0, _webpackMerge.default)(BROWSER_CONFIG, {
  entry: `${_paths.default.webpackEntryPoints}/kafe.js`,
  output: {
    filename: 'kafe.js'
  }
}); //-- kafe ES5

const KAFE_ES5_CONFIG = (0, _webpackMerge.default)(BROWSER_ES5_CONFIG, {
  entry: `${_paths.default.webpackEntryPoints}/kafe.js`,
  output: {
    filename: 'kafe-es5.js'
  }
}); //-- Generate a specific distribution config

const getConfig = (mainConfig, {
  source = _paths.default.package.sources,
  destination = _paths.default.package.distributions,
  name = '',
  externals = {}
} = {}) => {
  const targetedDestination = `${destination}/${mainConfig.target}`;

  _fss.default.ensureDir(targetedDestination);

  const finalSource = _fss.default.realpath(source);

  const finalDestination = _fss.default.realpath(targetedDestination);

  if (mainConfig.output && mainConfig.output.filename) {
    _fss.default.remove(`${finalDestination}/${mainConfig.output.filename}`);
  } else {
    _fss.default.remove(finalDestination);
  }

  const config = (0, _webpackMerge.default)(mainConfig, {
    output: {
      path: finalDestination
    },
    plugins: [new _webpack.default.DefinePlugin({
      'process.env.__PACKAGE_NAME__': JSON.stringify(name),
      'process.env.__PACKAGE_ROOT__': JSON.stringify(finalSource)
    }), new _friendlyErrorsWebpackPlugin.default({
      clearConsole: false
    })],
    externals
  });
  return config;
}; //-- Generate all distributions configs


const getConfigs = ({
  node,
  web = {},
  ...options
} = {}) => {
  const configs = [];
  const types = web.types || [];

  if (node) {
    types.push('node');
  }

  const webOptions = (0, _webpackMerge.default)(web, options);
  types.forEach(id => {
    switch (id) {
      case 'node':
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add Node.js distribution`);

        configs.push(getConfig(NODE_CONFIG, options));
        break;

      case 'browser':
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add browser distribution`);

        configs.push(getConfig(BROWSER_CONFIG, webOptions));
        break;

      case 'browserES5':
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add browser ES5 distribution`);

        configs.push(getConfig(BROWSER_ES5_CONFIG, webOptions));
        break;

      case 'kafe':
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add kafe distribution`);

        configs.push(getConfig(KAFE_CONFIG, webOptions));
        break;

      case 'kafeES5':
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add kafe ES5 distribution`);

        configs.push(getConfig(KAFE_ES5_CONFIG, webOptions));
        break;

      default:
        break;
    }
  });

  _terminal.terminal.spacer();

  return configs;
}; //-- webpack run wrapper


const webpackRunner = configs => {
  return new Promise(resolve => {
    (0, _webpack.default)(configs).run((error, stats) => {
      _terminal.terminal.echo(stats.toString({
        colors: true
      }));

      resolve();
    });
  });
}; //-- webpack watch wrapper


const webpackWatcher = (configs, output) => {
  return new Promise(resolve => {
    (0, _webpack.default)(configs).watch({
      ignored: [output],
      poll: 2000
    }, () =>
    /* error, stats */
    {
      resolve();
    });
  });
};
/**
 * Distribution options.
 *
 * @typedef {object} DistributionOptions
 * @property {string} [source={@link PackagePaths}.sources] - Package source path.
 * @property {string} [destination={@link PackagePaths}.distributions] - Package distributions path.
 * @property {boolean} [node] - Add a Node.js distribution.
 * @property {object} [web] - Web distributions options.
 * @property {Array<string>} web.types - List of web distributions (browser, browerES5, kafe, kafe, kafeES5).
 * @property {string} web.name - Public exposed name of package.
 * @property {object<string>} [web.externals] - List of required packages and their public name replacements ({@link https://webpack.js.org/configuration/externals docs}).
 */

/**
 * Distribution builder.
 *
 * @hideconstructor
 */


class Builder {
  /**
   * Build distributions.
   *
   * @async
   * @param {DistributionOptions} options - Options.
   * @returns {Promise} When runner completed.
   */
  run(options) {
    _terminal.terminal.print('Build distributions');

    return webpackRunner(getConfigs(options));
  }
  /**
   * Watch distributions builds.
   *
   * @async
   * @param {DistributionOptions} options - Options.
   * @returns {Promise} When watcher completed.
   */


  watch(options) {
    _terminal.terminal.print('Start watching distributions');

    return webpackWatcher(getConfigs(options));
  }
  /**
   * Build documentation theme scripts.
   *
   * @async
   * @param {object} options - Options.
   * @param {string} options.source - Path to documentation source scripts.
   * @param {string} options.destination - Path to documentation build script file.
   * @returns {Promise} When builder completed.
   */


  documentationTheme({
    source,
    destination
  }) {
    const [config] = getConfigs({
      web: {
        types: ['browserES5']
      },
      source
    });
    return webpackRunner([(0, _webpackMerge.default)(config, {
      mode: 'production',
      output: {
        filename: _path.default.basename(destination),
        path: _path.default.dirname(destination)
      }
    })]);
  }

}

var _default = new Builder();

exports.default = _default;
module.exports = exports.default;
module.exports.default = exports.default;