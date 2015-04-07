#!/bin/sh

# via https://github.com/lovell/sharp

# Ensures libvips is installed and attempts to install it if not
# Currently supports:
# * Debian Linux
#   * Ubuntu 12.04, 14.04, 14.10, 15.04

vips_version_minimum=8.0.0
vips_version_latest_major_minor=8.0
vips_version_latest_patch=0

install_libvips_from_source() {
  echo "Compiling libvips git from source"

  # pin working commit
  wget -O libvips.zip https://github.com/jcupitt/libvips/archive/5268f0280cd9d2f2f4880f01fb378a47e65aec35.zip
  unzip libvips.zip
  cd libvips-5268f0280cd9d2f2f4880f01fb378a47e65aec35
  ./bootstrap.sh
  ./configure --enable-debug=no --enable-docs=no --enable-cxx=yes --without-python --without-orc --without-fftw $1
  make
  make install
  cd ..
  rm -rf libvips-5268f0280cd9d2f2f4880f01fb378a47e65aec35
  rm libvips.zip
  ldconfig
  echo "Installed libvips git"
}

sorry() {
  echo "Sorry, I don't yet know how to install libvips on $1"
  exit 1
}

# Is libvips already installed, and is it at least the minimum required version?

if ! type pkg-config >/dev/null; then
  sorry "a system without pkg-config"
fi

pkg_config_path_homebrew=`which brew >/dev/null 2>&1 && eval $(brew --env) && echo $PKG_CONFIG_LIBDIR || true`
pkg_config_path="$pkg_config_path_homebrew:$PKG_CONFIG_PATH:/usr/local/lib/pkgconfig:/usr/lib/pkgconfig"

PKG_CONFIG_PATH=$pkg_config_path pkg-config --exists vips
if [ $? -eq 0 ]; then
  vips_version_found=$(PKG_CONFIG_PATH=$pkg_config_path pkg-config --modversion vips)
  pkg-config --atleast-version=$vips_version_minimum vips
  if [ $? -eq 0 ]; then
    # Found suitable version of libvips
    echo "Found libvips $vips_version_found"
    exit 0
  fi
  echo "Found libvips $vips_version_found but require $vips_version_minimum"
else
  echo "Could not find libvips using a PKG_CONFIG_PATH of '$pkg_config_path'"
fi

# Verify root/sudo access
if [ "$(id -u)" -ne "0" ]; then
  echo "Sorry, I need root/sudo access to continue"
  exit 1
fi

# OS-specific installations of libvips follows
case $(uname -s) in
  *)
    if [ -f /etc/debian_version ]; then
      # Debian Linux
      DISTRO=$(lsb_release -c -s)
      echo "Detected Debian Linux '$DISTRO'"
      case "$DISTRO" in
        trusty|utopic|qiana|rebecca)
          # Ubuntu 14, Mint 17
          install_libvips_from_source
          ;;
        *)
          sorry "this script is build for ubuntu $DISTRO"
          ;;
      esac
    else
      # Unsupported OS
      sorry "$(uname -a)"
    fi
    ;;
esac
