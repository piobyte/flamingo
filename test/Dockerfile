FROM ubuntu:xenial

ENV DEBIAN_FRONTEND noninteractive

# Install ffmpeg
COPY tools/install-ffmpeg.sh /tmp/
RUN bash /tmp/install-ffmpeg.sh; rm /tmp/install-ffmpeg.sh

# Install graphicsmagick
COPY tools/install-graphicsmagick.sh /tmp/
RUN bash /tmp/install-graphicsmagick.sh; rm /tmp/install-graphicsmagick.sh

# libelf-dev for flow-bin
# libfontconfig-dev libfreetype6 for webshot/phantom
RUN apt-get -y install git python build-essential libelf-dev libfontconfig-dev libfreetype6 pkg-config

# Install libvips
COPY tools/install-libvips.sh /tmp/
RUN bash /tmp/install-libvips.sh; rm /tmp/install-libvips.sh

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get -y install nodejs

# Bundle app source
COPY . /data

# Install app dependencies
RUN cd /data && \
    npm install && \
    npm dedupe

# Cleanup (after npm install because node-gyp)
RUN apt-get remove -y git lsb-release pkg-config python curl build-essential make xz-utils && \
    apt-get autoclean && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Define working directory.
WORKDIR /data

# Define default command.
CMD ["npm", "t"]
