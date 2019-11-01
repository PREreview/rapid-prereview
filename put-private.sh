#!/usr/bin/env bash

az storage blob upload --account-name rapidprereviewprivate --container-name "rapid-prereview-blobs" --name "deploy-env.private.sh" --file "deploy-env.private.sh"
az storage blob upload --account-name rapidprereviewprivate --container-name "rapid-prereview-blobs" --name "env.private.sh" --file "env.private.sh"
