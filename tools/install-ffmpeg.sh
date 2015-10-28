#!/usr/bin/env bash

# copied from node-fluent-ffmpeg install script
# https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/blob/master/tools/test-travis.sh

# Stop on error
set -e

# Install dependencies
if [ "$(uname)" = "Linux" ]; then
	# Linux
	apt-get update
	apt-get -y install wget tar bzip2

	wget http://johnvansickle.com/ffmpeg/builds/ffmpeg-git-64bit-static.tar.xz
	tar xf ffmpeg-git-64bit-static.tar.xz

	cp ffmpeg-git-*-static/{ffmpeg,ffprobe,ffserver} /usr/bin
	cp ffmpeg-git-*-static/{ffmpeg,ffprobe} $(pwd)

	export ALT_FFMPEG_PATH=$(pwd)/ffmpeg
	export ALT_FFPROBE_PATH=$(pwd)/ffprobe
fi

# Print versions

echo "ffmpeg version: $(ffmpeg -version)"
