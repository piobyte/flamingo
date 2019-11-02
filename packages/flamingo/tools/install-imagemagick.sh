#!/usr/bin/env bash

# Stop on error
set -e

ARCHIVE="https://www.imagemagick.org/download/ImageMagick.tar.gz"

cd /tmp/
wget ${ARCHIVE}
#wget ${ARCHIVE}.asc

#gpg --keyserver pgpkeys.mit.edu --recv-key 8277377A
#gpg ImageMagick.tar.gz.asc

tar zxf ImageMagick.tar.gz
cd ImageMagick-*

./configure --silent
make --silent
make install --silent

ldconfig

convert -version
