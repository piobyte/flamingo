#!/bin/sh

# Use of this script is deprecated

echo
echo "WARNING: This script will stop working at the end of 2016"
echo
echo "WARNING: This script is no longer required on most 64-bit Linux systems when using sharp v0.12.0+"
echo
echo "See http://sharp.dimens.io/page/install#linux"
echo
echo "If you really, really need this script, it will attempt"
echo "to globally install libvips if not already available."
echo
sleep 5

vips_version_minimum=8.4.2
vips_version_latest_major_minor=8.4
vips_version_latest_patch=2

openslide_version_minimum=3.4.0
openslide_version_latest_major_minor=3.4
openslide_version_latest_patch=1

install_libvips_from_source() {
  echo "Compiling libvips $vips_version_latest_major_minor.$vips_version_latest_patch from source"
  curl -O http://www.vips.ecs.soton.ac.uk/supported/$vips_version_latest_major_minor/vips-$vips_version_latest_major_minor.$vips_version_latest_patch.tar.gz
  tar zvxf vips-$vips_version_latest_major_minor.$vips_version_latest_patch.tar.gz
  cd vips-$vips_version_latest_major_minor.$vips_version_latest_patch
  CXXFLAGS="-D_GLIBCXX_USE_CXX11_ABI=0" ./configure --disable-debug --disable-docs --disable-static --disable-dependency-tracking --enable-cxx=yes --without-python --without-orc --without-fftw $1
  make
  make install
  cd ..
  rm -rf vips-$vips_version_latest_major_minor.$vips_version_latest_patch
  rm vips-$vips_version_latest_major_minor.$vips_version_latest_patch.tar.gz
  ldconfig
  echo "Installed libvips $(PKG_CONFIG_PATH=$PKG_CONFIG_PATH:/usr/local/lib/pkgconfig:/usr/lib/pkgconfig pkg-config --modversion vips)"
}

install_libopenslide_from_source() {
  echo "Compiling openslide $openslide_version_latest_major_minor.$openslide_version_latest_patch from source"
  curl -O -L https://github.com/openslide/openslide/releases/download/v$openslide_version_latest_major_minor.$openslide_version_latest_patch/openslide-$openslide_version_latest_major_minor.$openslide_version_latest_patch.tar.gz
  tar xzvf openslide-$openslide_version_latest_major_minor.$openslide_version_latest_patch.tar.gz
  cd openslide-$openslide_version_latest_major_minor.$openslide_version_latest_patch
  PKG_CONFIG_PATH=$pkg_config_path ./configure $1
  make
  make install
  cd ..
  rm -rf openslide-$openslide_version_latest_major_minor.$openslide_version_latest_patch
  rm openslide-$openslide_version_latest_major_minor.$openslide_version_latest_patch.tar.gz
  ldconfig
  echo "Installed libopenslide $openslide_version_latest_major_minor.$openslide_version_latest_patch"
}

sorry() {
  echo "Sorry, I don't yet know how to install lib$1 on $2"
  exit 1
}

pkg_config_path="$PKG_CONFIG_PATH:/usr/local/lib/pkgconfig:/usr/lib/pkgconfig"

check_if_library_exists() {
  PKG_CONFIG_PATH=$pkg_config_path pkg-config --exists $1
  if [ $? -eq 0 ]; then
    version_found=$(PKG_CONFIG_PATH=$pkg_config_path pkg-config --modversion $1)
    PKG_CONFIG_PATH=$pkg_config_path pkg-config --atleast-version=$2 $1
    if [ $? -eq 0 ]; then
      # Found suitable version of libvips
      echo "Found lib$1 $version_found"
      return 1
    fi
    echo "Found lib$1 $version_found but require $2"
  else
    echo "Could not find lib$1 using a PKG_CONFIG_PATH of '$pkg_config_path'"
  fi
  return 0
}

enable_openslide=0
# Is libvips already installed, and is it at least the minimum required version?
if [ $# -eq 1 ]; then
  if [ "$1" = "--with-openslide" ]; then
    echo "Installing vips with openslide support"
    enable_openslide=1
  else
    echo "Sorry, $1 is not supported. Did you mean --with-openslide?"
    exit 1
  fi
fi

if ! type pkg-config >/dev/null; then
  sorry "vips" "a system without pkg-config"
fi

openslide_exists=0
if [ $enable_openslide -eq 1 ]; then
  check_if_library_exists "openslide" "$openslide_version_minimum"
  openslide_exists=$?
fi

check_if_library_exists "vips" "$vips_version_minimum"
vips_exists=$?
if [ $vips_exists -eq 1 ] && [ $enable_openslide -eq 1 ]; then
  if [ $openslide_exists -eq 1 ]; then
    # Check if vips compiled with openslide support
    vips_with_openslide=`vips list classes | grep -i opensli`
    if [ -z $vips_with_openslide ]; then
      echo "Vips compiled without openslide support."
    else
      exit 0
    fi
  fi
elif [ $vips_exists -eq 1 ] && [ $enable_openslide -eq 0 ]; then
  exit 0
fi

# Verify root/sudo access
if [ "$(id -u)" -ne "0" ]; then
  echo "Sorry, I need root/sudo access to continue"
  exit 1
fi

# Deprecation warning
if [ "$(arch)" == "x86_64" ]; then
  echo "This script is no longer required on most 64-bit Linux systems when using sharp v0.12.0+"
fi

# OS-specific installations of libopenslide follows
# Either openslide does not exist, or vips is installed without openslide support
if [ $enable_openslide -eq 1 ] && [ -z $vips_with_openslide ] && [ $openslide_exists -eq 0 ]; then
  if [ -f /etc/debian_version ]; then
    # Debian Linux
    apt-get -y install lsb-release
    DISTRO=$(lsb_release -c -s)
    echo "Detected Debian Linux '$DISTRO'"
    case "$DISTRO" in
      jessie|vivid|wily|xenial)
        # Debian 8, Ubuntu 15
        echo "Installing libopenslide via apt-get"
        apt-get install -y libopenslide-dev
        ;;
      *)
        # Unsupported Debian-based OS
        sorry "openslide" "Debian-based $DISTRO"
        ;;
    esac
  else
    # Unsupported OS
    sorry "openslide" "$(uname -a)"
  fi
fi

# OS-specific installations of libvips follows

if [ -f /etc/debian_version ]; then
  # Debian Linux
  apt-get -y install lsb-release
  DISTRO=$(lsb_release -c -s)
  echo "Detected Debian Linux '$DISTRO'"
  case "$DISTRO" in
    jessie|trusty|utopic|vivid|wily|xenial|qiana|rebecca|rafaela|freya)
      # Debian 8, Ubuntu 14.04+, Mint 17
      echo "Installing libvips dependencies via apt-get"
      apt-get install -y automake build-essential gobject-introspection liborc-0.4-dev gtk-doc-tools libglib2.0-dev libglib2.0-dev libjpeg-turbo8-dev libgif-dev libpng12-dev libpango1.0-dev libpoppler-glib-dev libwebp-dev libtiff5-dev libexif-dev libgsf-1-dev liblcms2-dev librsvg2-dev libxml2-dev swig curl
      install_libvips_from_source
      ;;
    *)
      # Unsupported Debian-based OS
      sorry "vips" "Debian-based $DISTRO"
      ;;
  esac
else
  # Unsupported OS
  sorry "vips" "$(uname -a)"
fi
