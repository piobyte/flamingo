# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.5](https://github.com/piobyte/flamingo/compare/flamingo@3.0.4...flamingo@3.0.5) (2020-03-27)

**Note:** Version bump only for package flamingo





## [3.0.4](https://github.com/piobyte/flamingo/compare/flamingo@3.0.3...flamingo@3.0.4) (2020-02-19)

**Note:** Version bump only for package flamingo





## [3.0.3](https://github.com/piobyte/flamingo/compare/flamingo@3.0.2...flamingo@3.0.3) (2019-11-04)


### Bug Fixes

* remove request from path ([#34](https://github.com/piobyte/flamingo/issues/34)) ([ae0375f](https://github.com/piobyte/flamingo/commit/ae0375f))





## [3.0.2](https://github.com/piobyte/flamingo/compare/flamingo@3.0.1...flamingo@3.0.2) (2019-11-03)


### Bug Fixes

* remove dts-generator and simply include each files dts ([909ef97](https://github.com/piobyte/flamingo/commit/909ef97))





## [3.0.1](https://github.com/piobyte/flamingo/compare/flamingo@3.0.0...flamingo@3.0.1) (2019-11-03)


### Bug Fixes

* add dts generation again ([#31](https://github.com/piobyte/flamingo/issues/31)) ([424e4dc](https://github.com/piobyte/flamingo/commit/424e4dc))





# 3.0.0 (2019-11-02)


### Features

* upgrade to hapi v18 ([#28](https://github.com/piobyte/flamingo/issues/28)) ([3b161e5](https://github.com/piobyte/flamingo/commit/3b161e5))


### BREAKING CHANGES

* because addons can access hapi, this will probably
break them because it previously was v16





# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.1.11](https://github.com/piobyte/flamingo/compare/v2.1.10...v2.1.11) (2019-08-09)


### Bug Fixes

* bump samples to support sharp@0.23.0 ([e38f96b](https://github.com/piobyte/flamingo/commit/e38f96b))



<a name="2.1.10"></a>
## [2.1.10](https://github.com/piobyte/flamingo/compare/v2.1.9...v2.1.10) (2019-06-18)


### Bug Fixes

* remove unsupported output formats from best-format ([878f0da](https://github.com/piobyte/flamingo/commit/878f0da))



<a name="2.1.9"></a>
## [2.1.9](https://github.com/piobyte/flamingo/compare/v2.1.8...v2.1.9) (2019-01-30)



<a name="2.1.8"></a>
## [2.1.8](https://github.com/piobyte/flamingo/compare/v2.1.7...v2.1.8) (2018-10-04)



<a name="2.1.7"></a>
## [2.1.7](https://github.com/piobyte/flamingo/compare/v2.1.6...v2.1.7) (2018-10-04)



<a name="2.1.6"></a>
## [2.1.6](https://github.com/piobyte/flamingo/compare/v2.1.5...v2.1.6) (2018-09-07)



<a name="2.1.5"></a>
## [2.1.5](https://github.com/piobyte/flamingo/compare/v2.1.4...v2.1.5) (2018-05-22)



<a name="2.1.4"></a>
## [2.1.4](https://github.com/piobyte/flamingo/compare/v2.1.3...v2.1.4) (2018-05-13)


### Bug Fixes

* fix issue booting flamingo on node@10 ([ca3b1c9](https://github.com/piobyte/flamingo/commit/ca3b1c9))



<a name="2.1.3"></a>
## [2.1.3](https://github.com/piobyte/flamingo/compare/v2.1.2...v2.1.3) (2018-05-08)



<a name="2.1.2"></a>
## [2.1.2](https://github.com/piobyte/flamingo/compare/v2.1.1...v2.1.2) (2017-02-22)


### Bug Fixes

* **examples:** fix not using height query param to resize the image ([73a2152](https://github.com/piobyte/flamingo/commit/73a2152))
* **examples:** fix not using quality param while changing format ([c61322d](https://github.com/piobyte/flamingo/commit/c61322d))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/piobyte/flamingo/compare/v2.1.0...v2.1.1) (2017-02-20)


### Bug Fixes

* **examples:** ceil dimensions to avoid passing floating point numbers to sharp resize ([a697097](https://github.com/piobyte/flamingo/commit/a697097))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/piobyte/flamingo/compare/v2.0.2...v2.1.0) (2017-01-04)


### Features

* **addon:** add START, STOP hooks ([838dbef](https://github.com/piobyte/flamingo/commit/838dbef))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/piobyte/flamingo/compare/v2.0.1...v2.0.2) (2016-12-05)


### Bug Fixes

* **docker:** fixed docker builds throwing an error ([87b6fa9](https://github.com/piobyte/flamingo/commit/87b6fa9))
* **response:** fix response writer calling reply twice in case of stream error (fixes [#10](https://github.com/piobyte/flamingo/issues/10)) ([865b9eb](https://github.com/piobyte/flamingo/commit/865b9eb))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/piobyte/flamingo/compare/v2.0.0...v2.0.1) (2016-09-02)


### Bug Fixes

* **logger:** fixed no logging of the current route ([74de7c1](https://github.com/piobyte/flamingo/commit/74de7c1))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/piobyte/flamingo/compare/v1.5.0...v1.6.0) (2016-06-01)
