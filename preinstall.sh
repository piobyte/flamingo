#!/bin/sh

# via https://github.com/lovell/sharp
# via https://github.com/jcupitt/libvips#building-libvips-from-git

# pin working commit
COMMIT="5268f0280cd9d2f2f4880f01fb378a47e65aec35"

echo "Installing libvips via git (at ${COMMIT}) from source"

# download
wget -O libvips.zip https://github.com/jcupitt/libvips/archive/${COMMIT}.zip
unzip libvips.zip
cd libvips-${COMMIT}

# build
./bootstrap.sh
./configure --enable-debug=no --enable-docs=no --enable-cxx=yes --without-python --without-orc --without-fftw $1
make
make install
ldconfig

# cleanup
cd ..
rm -rf libvips-${COMMIT}
rm libvips.zip
echo "Installed libvips git"
