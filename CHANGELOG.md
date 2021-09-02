# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).






## [Unreleased]
### Added
- Add `fix` task which runs ESLint autofix and Prettier format on all package files
- Build pure ESM if package identifies as `module`
- In Node.js distribution, use `package.json` engine to configure Babel build

### Changed
- Update tester
- Maintenance update



## [2.1.0] - 2020-02-04
### Added
- Bundle Lerna with the manager

### Changed
- Use `@absolunet/brand-guidelines` for documentation styles
- Maintenance update

### Fixed
- Rebuild task on multi-package changes version in documentation on first run
- Manager works on Windows



## [2.0.1] - 2020-01-20
### Changed
- Remove strict mode on `@babel/plugin-transform-modules-commonjs` to expose `__esModule` property in builds
- Update tester
- Maintenance update



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






[Unreleased]:    https://github.com/absolunet/node-manager/compare/2.1.0...HEAD
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
