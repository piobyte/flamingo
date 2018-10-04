#!/usr/bin/env bash

# copied from node-fluent-ffmpeg install script
# https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/blob/master/tools/test-travis.sh

ARCHIVE="https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-64bit-static.tar.xz"
DIRNAME="ffmpeg-static"

# Stop on error
set -e

# Install dependencies
if [ "$(uname)" = "Linux" ]; then
	# Linux
	apt-get update
	apt-get -y install wget tar bzip2 xz-utils

  cd /tmp
	wget ${ARCHIVE} -O ${DIRNAME}.tar.xz
	mkdir ${DIRNAME}
	tar xvf ${DIRNAME}.tar.xz -C ${DIRNAME} --strip-components=1

	cp ${DIRNAME}/ffmpeg /usr/bin
	cp ${DIRNAME}/ffprobe /usr/bin
	cp ${DIRNAME}/ffmpeg $(pwd)
	cp ${DIRNAME}/ffprobe $(pwd)

	export ALT_FFMPEG_PATH=$(pwd)/ffmpeg
	export ALT_FFPROBE_PATH=$(pwd)/ffprobe
fi

# Print versions

echo "ffmpeg version: $(ffmpeg -version)"
