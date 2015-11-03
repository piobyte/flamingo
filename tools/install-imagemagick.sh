#!/usr/bin/env bash

# Stop on error
set -e

VERSION="6.9.2-5"
ARCHIVE="http://www.imagemagick.org/download/ImageMagick-${VERSION}.tar.gz"

cd /tmp/
wget ${ARCHIVE}
wget ${ARCHIVE}.asc

gpg --keyserver pgpkeys.mit.edu --recv-key 8277377A
gpg ImageMagick-${VERSION}.tar.gz.asc

tar zxf ImageMagick-${VERSION}.tar.gz
cd ImageMagick-${VERSION}

./configure --silent
make --silent
make install --silent

ldconfig

convert -version
