#!/usr/bin/env bash

# Stop on error
set -e

# polish mirror because it's faster (won't break travis builds with ~9min download)
ARCHIVE="http://ftp.icm.edu.pl/pub/unix/graphics/GraphicsMagick/GraphicsMagick-LATEST.tar.gz"
#ARCHIVE="ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/GraphicsMagick-LATEST.tar.gz"

cd /tmp/
wget ${ARCHIVE}
tar zxf GraphicsMagick-*.tar.gz
cd GraphicsMagick-*

# svg support
apt-get install -y libxml2-dev libfreetype6-dev libltdl-dev

./configure --enable-shared --with-modules --silent
make --silent
make install --silent

ldconfig

gm convert -version
