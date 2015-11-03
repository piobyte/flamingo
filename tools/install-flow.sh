#!/usr/bin/env bash

# Stop on error
set -e

wget http://flowtype.org/downloads/flow-linux64-latest.zip -O /tmp/flow.zip
unzip /tmp/flow.zip -d /tmp;

export PATH=$PATH:/tmp/flow/
