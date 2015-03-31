# Pull base image.
FROM dockerfile/nodejs:latest

# add ffmpeg repo
RUN add-apt-repository ppa:mc3man/trusty-media

# Install graphicsmagick, ffmpeg
RUN apt-get update && apt-get install -y graphicsmagick imagemagick libvips-dev ffmpeg

# Install some global utility tools
RUN npm install -g pm2

# Bundle app source
COPY . /data

# Install app dependencies
RUN cd /data; npm install

# Define working directory.
WORKDIR /data

# Expose application port
EXPOSE 3000

# Define default command.
CMD ["pm2", "start", "-x", "index.js", "--no-daemon"]
