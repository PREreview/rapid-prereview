#!/usr/bin/env bash

COUCH_URL=${COUCH_PROTOCOL}//${COUCH_USERNAME}:${COUCH_PASSWORD}@${COUCH_HOST}:${COUCH_PORT}

npx couchbackup --url ${COUCH_URL} --db rapid-prereview-index | gzip > rapid-prereview-index.txt.gz
npx couchbackup --url ${COUCH_URL} --db rapid-prereview-docs | gzip > rapid-prereview-docs.txt.gz
npx couchbackup --url ${COUCH_URL} --db rapid-prereview-users | gzip > rapid-prereview-users.txt.gz

az storage blob upload --account-name rapidprereviewprivate --container-name "rapid-prereview-backups" --name "rapid-prereview-index.txt.gz" --file "rapid-prereview-index.txt.gz"
az storage blob upload --account-name rapidprereviewprivate --container-name "rapid-prereview-backups" --name "rapid-prereview-docs.txt.gz" --file "rapid-prereview-docs.txt.gz"
az storage blob upload --account-name rapidprereviewprivate --container-name "rapid-prereview-backups" --name "rapid-prereview-users.txt.gz" --file "rapid-prereview-users.txt.gz"

rm rapid-prereview-index.txt.gz
rm rapid-prereview-docs.txt.gz
rm rapid-prereview-users.txt.gz
