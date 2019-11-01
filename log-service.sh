#!/usr/bin/env bash

az webapp log config --name "rapid-prereview-service" --resource-group "rapid-prereview" --docker-container-logging filesystem
az webapp log tail --name "rapid-prereview-service" --resource-group "rapid-prereview"
