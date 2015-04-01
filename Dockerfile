# Pull base image.
FROM dockerfile/nodejs:latest

# add ffmpeg repo
RUN add-apt-repository ppa:mc3man/trusty-media

# Install graphicsmagick, ffmpeg
RUN apt-get update && apt-get install -y graphicsmagick imagemagick ffmpeg pkg-config

# Install some global utility tools
RUN npm install -g pm2

# Bundle app source
COPY . /data

# Install vips
RUN cd /data; sh preinstall.sh

# Install app dependencies
RUN cd /data; npm install

# Define working directory.
WORKDIR /data

# Expose application port
EXPOSE 3000

# Define default command.
CMD ["pm2", "start", "-x", "index.js", "--no-daemon"]
