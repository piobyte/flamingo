#!/usr/bin/env bash

# Stop on error
set -e

GM_VERSION="1.3.26"

ARCHIVE="http://downloads.sourceforge.net/project/graphicsmagick/graphicsmagick/${GM_VERSION}/GraphicsMagick-${GM_VERSION}.tar.gz"

cd /tmp/
wget ${ARCHIVE}
tar zxf GraphicsMagick-*.tar.gz
cd GraphicsMagick-*

# svg support
apt-get install -y libxml2-dev libfreetype6-dev libltdl-dev make

./configure --enable-shared --with-modules --silent
make --silent
make install --silent

ldconfig

gm convert -version
