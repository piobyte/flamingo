# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
