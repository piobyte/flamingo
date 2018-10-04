FROM ubuntu:xenial

ENV DEBIAN_FRONTEND noninteractive

# Install ffmpeg
COPY tools/install-ffmpeg.sh /tmp/
RUN bash /tmp/install-ffmpeg.sh; rm /tmp/install-ffmpeg.sh

# Install graphicsmagick
COPY tools/install-graphicsmagick.sh /tmp/
RUN bash /tmp/install-graphicsmagick.sh; rm /tmp/install-graphicsmagick.sh

# libfontconfig-dev libfreetype6 for webshot/phantom
RUN apt-get -y install curl git python build-essential libfontconfig-dev libfreetype6 pkg-config

# Prepare nodejs
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get -y install nodejs yarn

# Bundle app source
COPY . /data

# Install app dependencies
RUN cd /data && \
    yarn

# Cleanup (after npm install because node-gyp)
RUN apt-get remove -y git lsb-release pkg-config python curl build-essential make xz-utils && \
    apt-get autoclean && \
    apt-get clean && \
    yarn cache clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Define working directory.
WORKDIR /data

# Define default command.
CMD ["yarn", "test"]
