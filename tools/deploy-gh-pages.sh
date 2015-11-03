#!/usr/bin/env bash

# Stop on error
set -e

README="README.md"
SUPPORTED_FORMATS="supported-files.md"
GH_USER_NAME="Travis-CI"
GH_USER_MAIL="travis@piobyte.de"
COMMIT_MSG="Deployed to Github Pages"

rm -rf docs || exit 0;
mkdir docs;

npm run formats
cat ${SUPPORTED_FORMATS} >> ${README}
npm run docs

( cd docs
 git init
 git config user.name ${GH_USER_NAME}
 git config user.email ${GH_USER_MAIL}
 git add .
 git commit -m "${COMMIT_MSG}"
 git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)
