FROM ubuntu:14.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get dist-upgrade -y && apt-get install -y software-properties-common curl

# install node
RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo bash -
RUN apt-get install -y nodejs

# add ffmpeg repo
RUN add-apt-repository -y ppa:mc3man/trusty-media && apt-get update && apt-get dist-upgrade -y

# Install imagemagick + some other pkgs
RUN apt-get install -y imagemagick pkg-config git unzip

# Install libvips dependencies
RUN apt-get update && \
    apt-get install -y wget automake gtk-doc-tools build-essential swig \
    gobject-introspection libglib2.0-dev libjpeg-dev libpng12-dev libwebp-dev libtiff5-dev libexif-dev libgsf-1-dev liblcms2-dev libxml2-dev libmagickwand-dev libmagickcore-dev

# Install ffmpeg
COPY tools/install-ffmpeg.sh /tmp/
RUN sh /tmp/install-ffmpeg.sh; rm /tmp/install-ffmpeg.sh

# Install graphicsmagick
COPY tools/install-graphicsmagick.sh /tmp/
RUN sh /tmp/install-graphicsmagick.sh; rm /tmp/install-graphicsmagick.sh

# Install vips
COPY tools/install-libvips.sh /tmp/
RUN sh /tmp/install-libvips.sh; rm /tmp/install-libvips.sh

# Install some global utility tools
RUN npm config set production; npm install -g forever

# Bundle app source
COPY . /data

# Install app dependencies
RUN cd /data; npm install flamingo-sentry --save; npm install; npm dedupe

# Cleanup (after npm install because node-gyp)
RUN apt-get remove -y curl automake build-essential && \
    apt-get autoremove -y && \
    apt-get autoclean && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Define working directory.
WORKDIR /data

# Expose application port
EXPOSE 3000

# Define default command.
CMD ["forever", "index.js"]
