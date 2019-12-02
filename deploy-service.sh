#!/usr/bin/env bash

## https://rapid-prereview-service.azurewebsites.net/

./deploy-env.private.sh service

## See https://docs.microsoft.com/en-us/azure/app-service/deploy-zip

zip -r service.zip *.json *.js dist/* src/* public/* views/* scripts/* test/* node_modules/*

## See https://docs.microsoft.com/en-us/azure/app-service/containers/configure-language-nodejs

## See https://github.com/projectkudu/kudu/wiki/Deploying-from-a-zip-file-or-url#issues-and-investigation
az webapp config appsettings set --resource-group "rapid-prereview" --name "rapid-prereview-service" --settings SCM_ZIPDEPLOY_DONOT_PRESERVE_FILETIME=1

## disabled as npm install fails sometimes see https://github.com/projectkudu/kudu/issues/2946
## az webapp config appsettings set --resource-group "rapid-prereview" --name "rapid-prereview-service" --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true

## https://docs.microsoft.com/en-us/azure/app-service/containers/configure-language-nodejs#run-with-pm2

# Azure App service will start the file with pm2
az webapp config set --resource-group "rapid-prereview" --name "rapid-prereview-service" --startup-file "./dist/service.js"

# to use without pm2:
# az webapp config set --resource-group "rapid-prereview" --name "rapid-prereview-service" --startup-file "npm run start:service-prod"

az webapp deployment source config-zip --resource-group "rapid-prereview" --name "rapid-prereview-service" --src service.zip

rm service.zip
