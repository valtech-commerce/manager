# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).






## [Unreleased]
### Added
- Add target option for browser distribution

### Changed
- Replace Lerna as main monorepo engine by native npm workspaces
- Replace custom code styling config with generic config
- Replace test package with custom tests
- Simplify package management to keep things lean
- Browser distribution choices are now `module` (latest browsers and ESM flavor) and `script` (major browsers and standalone drop-in flavor)
- Standardized distribution initialization options format

### Removed
- Remove `install` task
- Remove `publish` and `publish:unsafe` tasks
- Remove `browser-es5`, `kafe` and `kafe-es5` distribution choices



## [3.0.0-beta.6] - 2021-09-28
### Changed
- Maintenance updates



## [3.0.0-beta.5] - 2021-09-17
### Fixed
- Add missing dependency



## [3.0.0-beta.4] - 2021-09-17
### Changed
- Tester update



## [3.0.0-beta.3] - 2021-09-17
### Changed
- Maintenance updates

### Fixed
- Fix build when no original `dist` 



## [3.0.0-beta.2] - 2021-09-16
### Changed
- Maintenance updates

### Fixed
- Fix sub-packages Node.js builds so the removal of `main.js` works 



## [3.0.0-beta.1] - 2021-09-10
### Added
- Add `fix` task which runs ESLint autofix and Prettier format on all package files
- Build pure ESM if package identifies as `module`
- In Node.js distribution, use `package.json` engine to configure Babel build

### Changed
- Use [Lerna hoisting](https://github.com/lerna/lerna/blob/main/doc/hoist.md) for faster install and more stable tests
- Update tester
- Maintenance updates



## [2.1.0] - 2020-02-04
### Added
- Bundle Lerna with the manager

### Changed
- Use `@absolunet/brand-guidelines` for documentation styles
- Maintenance updates

### Fixed
- Rebuild task on multi-package changes version in documentation on first run
- Manager works on Windows



## [2.0.1] - 2020-01-20
### Changed
- Remove strict mode on `@babel/plugin-transform-modules-commonjs` to expose `__esModule` property in builds
- Update tester
- Maintenance updates



## [2.0.0] - 2019-10-18
### Added
- Community resources files

### Changed
- Update tester
- Maintenance updates

### Removed
- Update of Node.js version since it's now done by the tester



## [2.0.0-rc.1] - 2019-10-10
### Fixed
- Renamed `__assets` directory to `assets__` because GitHub Pages won't deploy directory



## [2.0.0-beta.1] - 2019-10-07
### Added
- Support for multi package repository
- Validation



## [2.0.0-alpha.3] - 2019-09-19
### Fixed
- Correct package to include all of dist



## [2.0.0-alpha.2] - 2019-09-19
### Added
- An option to copy extra files from sources

### Changed
- Refactor public export



## [2.0.0-alpha.1] - 2019-08-09
### Added
- JSDoc builder
- Source builder



## [1.1.0] - 2019-05-17
### Changed
- Standardize install



## [1.0.1] - 2019-05-14
### Fixed
- Case that postinstall is run when used as dependency



## [1.0.0] - 2019-05-14
### Added
- Single package support



## [0.5.1] - 2019-05-01
### Fixed
- Correction new terminal package definition



## [0.5.0] - 2019-04-30
### Added
- `updatePackageMeta()`
- `testOutdated()`
- `installPackage()`



## [0.4.0] - 2018-12-04
### Changed
- Pack before publishing



## [0.3.0] - 2018-11-30
### Added
- Pre/Post hooks on scripts



## [0.2.3] - 2018-11-23
### Fixed
- Typo



## [0.2.2] - 2018-11-23
### Changed
- Add spacing to match npm's standard



## [0.2.1] - 2018-11-23
### Changed
- Terminology change to be independent from npm native



## [0.2.0] - 2018-11-23
### Added
- Custom publishing



## [0.1.0] - 2018-11-22
### Added
- Initial






[Unreleased]:    https://github.com/absolunet/node-manager/compare/3.0.0-beta.6...HEAD
[3.0.0-beta.6]:  https://github.com/absolunet/node-manager/compare/3.0.0-beta.5...3.0.0-beta.6
[3.0.0-beta.5]:  https://github.com/absolunet/node-manager/compare/3.0.0-beta.4...3.0.0-beta.5
[3.0.0-beta.4]:  https://github.com/absolunet/node-manager/compare/3.0.0-beta.3...3.0.0-beta.4
[3.0.0-beta.3]:  https://github.com/absolunet/node-manager/compare/3.0.0-beta.2...3.0.0-beta.3
[3.0.0-beta.2]:  https://github.com/absolunet/node-manager/compare/3.0.0-beta.1...3.0.0-beta.2
[3.0.0-beta.1]:  https://github.com/absolunet/node-manager/compare/2.1.0...3.0.0-beta.1
[2.1.0]:         https://github.com/absolunet/node-manager/compare/2.0.1...2.1.0
[2.0.1]:         https://github.com/absolunet/node-manager/compare/2.0.0...2.0.1
[2.0.0]:         https://github.com/absolunet/node-manager/compare/2.0.0-rc.1...2.0.0
[2.0.0-rc.1]:    https://github.com/absolunet/node-manager/compare/2.0.0-beta.1...2.0.0-rc.1
[2.0.0-beta.1]:  https://github.com/absolunet/node-manager/compare/2.0.0-alpha.3...2.0.0-beta.1
[2.0.0-alpha.3]: https://github.com/absolunet/node-manager/compare/2.0.0-alpha.2...2.0.0-alpha.3
[2.0.0-alpha.2]: https://github.com/absolunet/node-manager/compare/2.0.0-alpha.1...2.0.0-alpha.2
[2.0.0-alpha.1]: https://github.com/absolunet/node-manager/compare/1.1.0...2.0.0-alpha.1
[1.1.0]:         https://github.com/absolunet/node-manager/compare/1.0.1...1.1.0
[1.0.1]:         https://github.com/absolunet/node-manager/compare/1.0.0...1.0.1
[1.0.0]:         https://github.com/absolunet/node-manager/compare/0.5.1...1.0.0
[0.5.1]:         https://github.com/absolunet/node-manager/compare/0.5.0...0.5.1
[0.5.0]:         https://github.com/absolunet/node-manager/compare/0.4.0...0.5.0
[0.4.0]:         https://github.com/absolunet/node-manager/compare/0.3.0...0.4.0
[0.3.0]:         https://github.com/absolunet/node-manager/compare/0.2.3...0.3.0
[0.2.3]:         https://github.com/absolunet/node-manager/compare/0.2.2...0.2.3
[0.2.2]:         https://github.com/absolunet/node-manager/compare/0.2.1...0.2.2
[0.2.1]:         https://github.com/absolunet/node-manager/compare/0.2.0...0.2.1
[0.2.0]:         https://github.com/absolunet/node-manager/compare/0.1.0...0.2.0
[0.1.0]:         https://github.com/absolunet/node-manager/releases/tag/0.1.0
