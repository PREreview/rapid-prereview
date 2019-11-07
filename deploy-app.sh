#!/usr/bin/env bash

## Deploy to https://rapid-prereview.azurewebsites.net/

./deploy-env.private.sh app

## See https://docs.microsoft.com/en-us/azure/app-service/deploy-zip

zip -r app.zip *.json *.js dist/* src/* public/* views/* scripts/* test/*

## See https://docs.microsoft.com/en-us/azure/app-service/containers/configure-language-nodejs

az webapp config appsettings set --resource-group "rapid-prereview" --name "rapid-prereview" --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true


## https://docs.microsoft.com/en-us/azure/app-service/containers/configure-language-nodejs#run-with-pm2

# Azure App service will start the file with pm2
az webapp config set --resource-group "rapid-prereview" --name "rapid-prereview" --startup-file "./dist/server.js"

# to use without pm2:
# az webapp config set --resource-group "rapid-prereview" --name "rapid-prereview" --startup-file "npm run start:prod"


az webapp deployment source config-zip --resource-group "rapid-prereview" --name "rapid-prereview" --src app.zip

rm app.zip
