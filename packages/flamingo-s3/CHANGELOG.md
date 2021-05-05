# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0](https://github.com/piobyte/flamingo-s3/compare/flamingo-s3@3.0.7...flamingo-s3@4.0.0) (2021-05-05)


### chore

* bump minimum node version to 14 ([24982fe](https://github.com/piobyte/flamingo-s3/commit/24982fe6afd02c6005ba2361d734f098fbd01f1b)), closes [#46](https://github.com/piobyte/flamingo-s3/issues/46)


### BREAKING CHANGES

* this makes all flamingo packages to require nodejs >= 14 now





## [3.0.7](https://github.com/piobyte/flamingo-s3/compare/flamingo-s3@3.0.6...flamingo-s3@3.0.7) (2020-10-28)

**Note:** Version bump only for package flamingo-s3





## [3.0.6](https://github.com/piobyte/flamingo-s3/compare/flamingo-s3@3.0.5...flamingo-s3@3.0.6) (2020-08-10)

**Note:** Version bump only for package flamingo-s3





## [3.0.5](https://github.com/piobyte/flamingo-s3/compare/flamingo-s3@3.0.4...flamingo-s3@3.0.5) (2020-03-27)

**Note:** Version bump only for package flamingo-s3





## [3.0.4](https://github.com/piobyte/flamingo-s3/compare/flamingo-s3@3.0.3...flamingo-s3@3.0.4) (2020-02-19)

**Note:** Version bump only for package flamingo-s3





## [3.0.3](https://github.com/piobyte/flamingo-s3/compare/flamingo-s3@3.0.2...flamingo-s3@3.0.3) (2019-11-04)


### Bug Fixes

* return InvalidInputError if s3 head fails ([#33](https://github.com/piobyte/flamingo-s3/issues/33)) ([7be623f](https://github.com/piobyte/flamingo-s3/commit/7be623f)), closes [#32](https://github.com/piobyte/flamingo-s3/issues/32)





## [3.0.2](https://github.com/piobyte/flamingo-s3/compare/flamingo-s3@3.0.1...flamingo-s3@3.0.2) (2019-11-03)


### Bug Fixes

* remove dts-generator and simply include each files dts ([909ef97](https://github.com/piobyte/flamingo-s3/commit/909ef97))





## [3.0.1](https://github.com/piobyte/flamingo-s3/compare/flamingo-s3@3.0.0...flamingo-s3@3.0.1) (2019-11-03)


### Bug Fixes

* add dts generation again ([#31](https://github.com/piobyte/flamingo-s3/issues/31)) ([424e4dc](https://github.com/piobyte/flamingo-s3/commit/424e4dc))





# 3.0.0 (2019-11-02)


### Features

* upgrade to hapi v18 ([#28](https://github.com/piobyte/flamingo-s3/issues/28)) ([3b161e5](https://github.com/piobyte/flamingo-s3/commit/3b161e5))


### BREAKING CHANGES

* because addons can access hapi, this will probably
break them because it previously was v16





# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.2.0"></a>
# [2.2.0](https://github.com/piobyte/flamingo-s3/compare/v2.1.0...v2.2.0) (2018-05-08)


### Features

* expose way to force pathStyle ([10e9362](https://github.com/piobyte/flamingo-s3/commit/10e9362)), closes [/docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#s3](https://github.com//docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html/issues/s3)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/piobyte/flamingo-s3/compare/v2.0.1...v2.1.0) (2017-12-28)


### Bug Fixes

* **tutorial:** fix tutorial using empty addon loader ([c73b0a3](https://github.com/piobyte/flamingo-s3/commit/c73b0a3))
* use flow type definition for aws config object ([ae3f345](https://github.com/piobyte/flamingo-s3/commit/ae3f345))
* use latest flamingo to fix invalid dependency ([0df09b5](https://github.com/piobyte/flamingo-s3/commit/0df09b5))


### Features

* added option to specify the aws endpoint ([#1](https://github.com/piobyte/flamingo-s3/issues/1)) ([808e7da](https://github.com/piobyte/flamingo-s3/commit/808e7da))
