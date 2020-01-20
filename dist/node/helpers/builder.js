"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _babelPluginAddModuleExports = _interopRequireDefault(require("babel-plugin-add-module-exports"));

var _chalk = _interopRequireDefault(require("chalk"));

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

var _environment = _interopRequireDefault(require("./environment"));

var _paths = _interopRequireDefault(require("./paths"));

var _util = _interopRequireDefault(require("./util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//--------------------------------------------------------
//-- Builder
//--------------------------------------------------------
//-- Actions
const BUILD = 'Build distribution for';
const WATCH = 'Start watching in'; //-- Common

const COMMON_CONFIG = {
  mode: 'none',
  devtool: ''
}; //-- Node.js

const nodeConfig = source => {
  return (0, _webpackMerge.default)(COMMON_CONFIG, {
    target: 'node',
    entry: `${_paths.default.webpackEntryPoints}/node.js`,
    plugins: [new _disableOutputWebpackPlugin.default(), new _copyWebpackPlugin.default([{
      context: source,
      from: '**/!(*.d).js',
      to: '',
      cache: true,
      transform: content => {
        return (0, _core.transformAsync)(content, {
          plugins: [[_pluginTransformModulesCommonjs.default, {
            strict: false
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
  });
}; //-- Browser


const BROWSER_CONFIG = (0, _webpackMerge.default)(COMMON_CONFIG, {
  target: 'web',
  entry: `${_paths.default.webpackEntryPoints}/browser.js`,
  output: {
    filename: `${_environment.default.DISTRIBUTION_TYPE.browser}.js`
  }
}); //-- Browser ES5

const BROWSER_ES5_CONFIG = (0, _webpackMerge.default)(BROWSER_CONFIG, {
  output: {
    filename: `${_environment.default.DISTRIBUTION_TYPE.browserES5}.js`
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
    filename: `${_environment.default.DISTRIBUTION_TYPE.kafe}.js`
  }
}); //-- kafe ES5

const KAFE_ES5_CONFIG = (0, _webpackMerge.default)(BROWSER_ES5_CONFIG, {
  entry: `${_paths.default.webpackEntryPoints}/kafe.js`,
  output: {
    filename: `${_environment.default.DISTRIBUTION_TYPE.kafeES5}.js`
  }
}); //-- Generate a specific distribution config

const getDistributionConfig = (mainConfig, {
  source,
  destination = _paths.default.package.distributions,
  name = '',
  externals = {},
  include = []
} = {}) => {
  const targetedDestination = `${destination}/${mainConfig.target}`;

  _fss.default.ensureDir(targetedDestination);

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
      'process.env.__PACKAGE_ROOT__': JSON.stringify(source)
    }), new _friendlyErrorsWebpackPlugin.default({
      clearConsole: false
    })],
    externals
  }); // Extra files to include

  const filtered = include.filter(pattern => {
    return !(pattern.startsWith('/') || pattern.startsWith('.'));
  });

  if (filtered.length !== 0) {
    config.plugins.push(new _copyWebpackPlugin.default(filtered.map(pattern => {
      return {
        context: source,
        from: pattern,
        to: finalDestination,
        cache: false,
        flatten: false
      };
    })));
  }

  return config;
}; //-- Generate all distributions configs


const getAllDistributionsConfigs = ({
  node,
  web = {},
  ...options
} = {}, action) => {
  const configs = [];
  const types = web.types || [];

  if (node) {
    types.push('node');
  }

  options.source = _fss.default.realpath(options.source || _paths.default.package.sources);

  _terminal.terminal.print(`${action} ${_chalk.default.underline(_util.default.relativizePath(options.source))}`);

  const webOptions = (0, _webpackMerge.default)(web, options);
  types.forEach(id => {
    switch (id) {
      case _environment.default.DISTRIBUTION_TYPE.node:
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add Node.js distribution`);

        configs.push(getDistributionConfig(nodeConfig(options.source), options));
        break;

      case _environment.default.DISTRIBUTION_TYPE.browser:
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add browser distribution`);

        configs.push(getDistributionConfig(BROWSER_CONFIG, webOptions));
        break;

      case _environment.default.DISTRIBUTION_TYPE.browserES5:
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add browser ECMAScript 5 distribution`);

        configs.push(getDistributionConfig(BROWSER_ES5_CONFIG, webOptions));
        break;

      case _environment.default.DISTRIBUTION_TYPE.kafe:
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add kafe distribution`);

        configs.push(getDistributionConfig(KAFE_CONFIG, webOptions));
        break;

      case _environment.default.DISTRIBUTION_TYPE.kafeES5:
        _terminal.terminal.print(`${_figures.default.pointerSmall} Add kafe ECMAScript 5 distribution`);

        configs.push(getDistributionConfig(KAFE_ES5_CONFIG, webOptions));
        break;

      default:
        break;
    }
  });

  _terminal.terminal.spacer();

  return configs;
}; //-- Generate multiple in/out configs


const getMultipleInOutConfigs = (options, multipleInOut, action) => {
  const configs = multipleInOut.reduce((list, {
    source,
    destination
  }) => {
    list.push(...getAllDistributionsConfigs((0, _webpackMerge.default)(options, {
      source,
      destination
    }), action));
    return list;
  }, []);
  return configs;
}; //-- webpack run wrapper


const webpackRunner = configs => {
  return new Promise(resolve => {
    (0, _webpack.default)(configs).run((error, stats) => {
      _terminal.terminal.echo(stats.toString({
        colors: true
      }));

      _terminal.terminal.spacer(2);

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
   * @param {Array<{ source: string, destination: string }>} multipleInOut - List of source / destination.
   * @returns {Promise} When runner completed.
   */
  run(options, multipleInOut) {
    return webpackRunner(multipleInOut ? getMultipleInOutConfigs(options, multipleInOut, BUILD) : getAllDistributionsConfigs(options, BUILD));
  }
  /**
   * Watch distributions builds.
   *
   * @async
   * @param {DistributionOptions} options - Options.
   * @param {Array<{ source: string, destination: string }>} multipleInOut - List of source / destination.
   * @returns {Promise} When watcher completed.
   */


  watch(options, multipleInOut) {
    return webpackWatcher(multipleInOut ? getMultipleInOutConfigs(options, multipleInOut, WATCH) : getAllDistributionsConfigs(options, WATCH));
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
    const [config] = getAllDistributionsConfigs({
      web: {
        types: [_environment.default.DISTRIBUTION_WEB_TYPE.browserES5]
      },
      source
    }, BUILD);
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