#!/usr/bin/env bash

## https://rapid-prereview-service.azurewebsites.net/

./deploy-env.private.sh service

## See https://docs.microsoft.com/en-us/azure/app-service/deploy-zip

zip -r service.zip *.json *.js dist/* src/* public/* views/* scripts/* test/*

## See https://docs.microsoft.com/en-us/azure/app-service/containers/configure-language-nodejs

az webapp config appsettings set --resource-group "rapid-prereview" --name "rapid-prereview-service" --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true

az webapp config set --resource-group "rapid-prereview" --name "rapid-prereview-service" --startup-file "npm run start:service"

az webapp deployment source config-zip --resource-group "rapid-prereview" --name "rapid-prereview-service" --src service.zip

rm service.zip
