#!/usr/bin/env bash

# Stop on error
set -e

GM_VERSION="1.3.35"

ARCHIVE="https://downloads.sourceforge.net/project/graphicsmagick/graphicsmagick/${GM_VERSION}/GraphicsMagick-${GM_VERSION}.tar.gz"

cd /tmp/
wget ${ARCHIVE}
tar zxf GraphicsMagick-${GM_VERSION}.tar.gz
cd GraphicsMagick-${GM_VERSION}

# svg support
apt-get install -y libxml2-dev libfreetype6-dev libltdl-dev make

./configure --enable-shared --with-modules --silent
make --silent
make install --silent

ldconfig

gm convert -version
