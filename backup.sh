#!/usr/bin/env bash

COUCH_URL=${COUCH_PROTOCOL}//${COUCH_USERNAME}:${COUCH_PASSWORD}@${COUCH_HOST}:${COUCH_PORT}

## TODO pipe to azcopy
npx couchbackup --url ${COUCH_URL} --db rapid-prereview-index | gzip > rapid-prereview-index.txt.gz
npx couchbackup --url ${COUCH_URL} --db rapid-prereview-docs | gzip > rapid-prereview-docs.txt.gz
npx couchbackup --url ${COUCH_URL} --db rapid-prereview-users | gzip > rapid-prereview-users.txt.gz
