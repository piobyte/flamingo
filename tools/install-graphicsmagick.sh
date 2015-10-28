#!/usr/bin/env bash

VERSION="1.3.22"
MAJOR="1.3"

ARCHIVE="http://ftp.icm.edu.pl/pub/unix/graphics/GraphicsMagick/${MAJOR}/GraphicsMagick-${VERSION}.tar.gz"
#ARCHIVE="ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/${MAJOR}/GraphicsMagick-${VERSION}.tar.gz"

cd /tmp/
wget ${ARCHIVE}
tar zxvf GraphicsMagick-${VERSION}.tar.gz
cd GraphicsMagick-${VERSION}

# svg support
apt-get -y libxml2-dev freetype

./configure --enable-shared --with-modules
make
make install

ldconfig

gm convert -version
