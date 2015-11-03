#!/usr/bin/env bash

# Stop on error
set -e

VERSION="1.3.22"
MAJOR="1.3"

# polish mirror because it's faster
ARCHIVE="http://ftp.icm.edu.pl/pub/unix/graphics/GraphicsMagick/${MAJOR}/GraphicsMagick-${VERSION}.tar.gz"
#ARCHIVE="ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/${MAJOR}/GraphicsMagick-${VERSION}.tar.gz"

cd /tmp/
wget ${ARCHIVE}
tar zxf GraphicsMagick-${VERSION}.tar.gz
cd GraphicsMagick-${VERSION}

# svg support
apt-get install -y libxml2-dev libfreetype6-dev

./configure --enable-shared --with-modules --silent
make --silent
make install --silent

ldconfig

gm convert -version
