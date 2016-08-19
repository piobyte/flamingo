FROM ubuntu:14.04

ENV DEBIAN_FRONTEND noninteractive

# install ubuntu dependencies
RUN apt-get update && \
    apt-get dist-upgrade -y && \
    apt-get install -y software-properties-common curl pkg-config git unzip wget automake build-essential python

# install node
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs

# Install ffmpeg
COPY tools/install-ffmpeg.sh /tmp/
RUN bash /tmp/install-ffmpeg.sh; rm /tmp/install-ffmpeg.sh

# Install graphicsmagick
COPY tools/install-graphicsmagick.sh /tmp/
RUN bash /tmp/install-graphicsmagick.sh; rm /tmp/install-graphicsmagick.sh

# Bundle app source
COPY . /data

# Install app dependencies
RUN cd /data && \
    npm install && \
    npm dedupe

# Cleanup (after npm install because node-gyp)
RUN apt-get remove -y software-properties-common curl pkg-config git unzip wget automake build-essential python && \
    apt-get autoremove -y && \
    apt-get autoclean && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Define working directory.
WORKDIR /data

# Define default command.
CMD ["npm", "test"]
