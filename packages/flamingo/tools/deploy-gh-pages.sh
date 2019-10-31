#!/usr/bin/env bash

# Stop on error
set -e

if ! which jq >/dev/null; then
    echo "script requires jq"
    exit 1
fi

COMMIT_MSG="Deployed to Github Pages"
DOCS_DIR="docs"
GH_REPO="piobyte/flamingo.git"

NAME=$(jq -r .name package.json)
VERSION=$(jq -r .version package.json)
BRANCH_NAME=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')

#if [ "$branch" == "master" ]
#  then
  rm -rf docs || exit 0;
  mkdir docs;

  npm run cover
  npm run formats
  npm run docs
  mv ${DOCS_DIR}/${NAME}/${VERSION}/* ${DOCS_DIR}

  mkdir ${DOCS_DIR}/coverage;
  mv coverage/lcov-report/* ${DOCS_DIR}/coverage
  rm -rf "docs/${NAME}"

  ( cd ${DOCS_DIR}
   git init
   git add .
   git commit -m "${COMMIT_MSG}"
   git push --force "git@github.com:${GH_REPO}" master:gh-pages
  )

  rm -rf ${DOCS_DIR}
#else
#  echo "Will not publish from a branch other than master."
#fi
