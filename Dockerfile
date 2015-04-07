# Pull base image.
FROM dockerfile/nodejs:latest

# add ffmpeg repo
RUN add-apt-repository ppa:mc3man/trusty-media

# Install graphicsmagick, ffmpeg
RUN apt-get update && apt-get install -y graphicsmagick imagemagick ffmpeg pkg-config git unzip

# Install libvips dependencies
RUN apt-get update && apt-get install -y automake build-essential gobject-introspection gtk-doc-tools libglib2.0-dev libjpeg-turbo8-dev libpng12-dev libwebp-dev libtiff5-dev libexif-dev libgsf-1-dev liblcms2-dev libxml2-dev swig libmagickcore-dev curl

# Install some global utility tools
RUN npm config set production; npm install -g forever

# Install vips
COPY preinstall.sh /tmp/
RUN sh /tmp/preinstall.sh; rm /tmp/preinstall.sh

# Bundle app source
COPY . /data
RUN cd /data;

# Install app dependencies
RUN npm install; npm dedupe

# Define working directory.
WORKDIR /data

# Expose application port
EXPOSE 3000

# Define default command.
CMD ["forever", "index.js"]
