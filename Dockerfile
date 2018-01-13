FROM ubuntu:xenial

ENV DEBIAN_FRONTEND noninteractive

# Install ffmpeg
COPY tools/install-ffmpeg.sh /tmp/
RUN bash /tmp/install-ffmpeg.sh; rm /tmp/install-ffmpeg.sh

# Install various applications
RUN apt-get -y install curl git python pkg-config

# Prepare nodejs
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get -y install nodejs yarn

RUN yarn global add forever

# Bundle app source
COPY . /data

# Install app dependencies
RUN cd /data && \
  yarn add wrappy --ignore-optional && \
  yarn --ignore-optional --prod

# Cleanup (after npm install because node-gyp)
RUN apt-get remove -y software-properties-common curl pkg-config lsb-release git unzip wget automake build-essential python && \
    apt-get autoclean && \
    apt-get clean && \
    yarn cache clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Define working directory.
WORKDIR /data

# Expose application port
EXPOSE 3000

# Define default command.
CMD ["forever", "index.js"]
