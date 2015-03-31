#!/usr/bin/env bash

set -e

rm -rf docs || exit 0;
mkdir docs;

node make docs

( cd docs
 git init
 git config user.name "Travis-CI"
 git config user.email "travis@piobyte.de"
 git add .
 git commit -m "Deployed to Github Pages"
 git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)
