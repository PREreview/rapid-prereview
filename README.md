![OSrPRE logo](https://github.com/PREreview/rapid-prereview/raw/master/OSRP-logo.png)

# Welcome to Outbreak Science Rapid PREreview!

## What is it?

Outbreak Science Rapid PREreview is an **application for rapid, structured reviews of outbreak-related preprints**. The platform allows any researcher with an ORCID iD to provide a quick high-level evaluation of preprints via a series of questions to assess the originality and soundness of the research findings. Aggregated data from these reviews is visualized to allow readers to identify the most relevant information. This tool has the capacity to be transformative for on-the-ground health workers, researchers, public health agencies, and the public, as it can quickly unlock key scientific information during an outbreak of infectious diseases.

## Our team

Outbreak Science Rapid PREreview is a project born from the collaboration of PREreview and Outbreak Science.

[PREreview](https://v2.prereview.org) is an open project fiscally sponsored by the non-profit organization Code for Science & Society. PREreview's mission is to increase diversity in the scholarly peer review process by empowering all researchers to engage with preprint reviews.

[Outbreak Science](https://outbreasci.org) is a non-profit organization aimed at advancing the science of outbreak response, in particular by supporting early and open dissemination of data, code, and analytical results.


## Funding

This collaborative project is mainly funded by the [Wellcome Trust Open Research Fund](https://wellcome.ac.uk/funding/schemes/open-research-fund), but has also received support from the Mozilla Foundation.


## Information about this repository

[![CircleCI](https://circleci.com/gh/PREreview/rapid-prereview.svg?style=svg&circle-token=40b07ebe214d49722b30d628f483734cff70ee52)](https://circleci.com/gh/PREreview/rapid-prereview)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Outbreak Science Rapid PREreview focuses on providing the best infrastructure to request /
provide / analyze feedback (structured reviews) on _existing_ preprints relevant
to the outbreak community.

The feedback should be of use to:
1. the outbreak community (academics)
2. workers, editors, journalists (visualization etc.)

Outbreak Science Rapid PREreview does _not_ focus on:
- coordinating research effort / data analysis / calling for research during
  emergency situations
- becoming / being a preprint server

**[Join PREreview Slack
Channel](https://join.slack.com/t/prereview/shared_invite/enQtMzYwMjQzMTk3ODMxLTZhOWQ5M2FmMTY5OTYzZDNhNDg2ZDdhODE2Y2Y4MTVjY2U0OWRiZTA5ZjM3MWM1ZTY0N2E1ODYyNWM1NTc2NDg)**

## Development

### Getting started

#### Required software

1. [`git`](https://git-scm.org/) is used for versioning in this project.

1. [Docker](https://www.docker.com/) is used to manage services for local development.

This repo also contains configuration files for Visual Studio Code's Remote Containers which reduces the need to manually execute Docker commands; see [the Visual Studio Code manual](https://code.visualstudio.com/docs/remote/containers) for more information about how to use these.

#### Creating the environment

1. `docker-compose -f .devcontainer/docker-compose.yml up --build`

This command will keep running in the shell to display log output from all services; you can stop the server by typing Control+C.

#### Running commands in the container

1. `docker-compose -f .devcontainer/docker-compose.yml exec web bash`

The source folder will appear in the container as `/workspace`; change to that directory before running any `npm` commands.
You can edit these files with your preferred editor and the container will stay updated.

#### Viewing logs
1. `docker-compose -f .devcontainer/docker-compose.yml logs`

You can optionally name a service whose logs you want to view; the default is to show logs for all services.
Service names are defined in `docker-compose.yml` and include 'web', 'cache', 'db'.

You should have everything needed to follow the rest of this README.

### Dependencies

At the root of this repository run:

```sh
npm install
```

#### Troubleshooting

If you are having permission issues with `npm` checkout
https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

### App (web server)

Please note the section above labelled 'Running commands in the container.'

```sh
npm run init
```

to setup the databases.

To seed the app with some data run:

```sh
npm run seed
```

After, run:

```sh
npm start
```

and visit [http://127.0.0.1:3000/](http://127.0.0.1:3000/)


If you want to start from an empty state (or reset the DB to an empty state) you can run:

```sh
npm run reset
```

### Web extension

#### Development

To work (or test / demo) the extension you can:
1. start a dev server (run `npm start`)
2. follow the instruction below depending on whether you want to work with
   Chrome or Firefox.

##### Chrome

1. Run `npm run extension:watch` that will build and watch the extension in the
   `extension` directory. ! DO NOT EDIT THE FILES THERE or do not tack them on
   git, with the exception of `manifest.json`, `fonts/`, `icons/` and
   `popup.html`.
2. Navigate to `chrome://extensions/`, be sure to toggle the "developer mode",
   click on "load unpacked" and select the content of the `extension` directory.


##### Firefox

1. Run `npm run extension:watch-firefox` that will build and watch the extension in the
   `extension` directory. ! DO NOT EDIT THE FILES THERE or do not tack them on
   git, with the exception of `manifest.json`, `fonts/`, `icons/` and
   `popup.html`.
2. Navigate to `about:debugging`, and click on "Load Temporary Add-on" and
   select the `extension/manifest.json` file.


##### Troubleshooting

**Never run `npm run extension:watch` and `npm run extension:watch-firefox` at
the same time as they will overwrite each other.** If you did:

1. kill all the node processes (`ctr+c` in each shell)
2. run `killal node` to be sure you no longer have node processes running
3. restart the web server `npm start` and one of the extension watcher `npm run
   extension:watch` **OR** `npm run extension:watch-firefox`


#### Production (publish to web stores)

##### Chrome

1. Run `npm install`
2. Set the `version` property of the `extension/manifest.json` file
3. Run `npm run extension:build`
4. Run `npm run extension:pack`
5. Upload the created `extension.zip` file to the [Chrome web store](https://chrome.google.com/webstore/developer/dashboard)

##### Firefox

1. Run `npm install`
2. Set the `version` property of the `extension/manifest.json` file
3. Run `npm run extension:build-firefox`
4. Run `npm run extension:pack-firefox`
5. Upload the created `extension-firefox.zip` file to the [Firefox web
   store](https://addons.mozilla.org/en-US/developers/)


Note: to include the unbundled source code of the extension (asked by Mozilla
add on) run `npm run extension:pack-src` and include the following text when you
upload the generated `extension-src.zip`:

> The extension is built with webpack (config is
> webpack-extension.config.js). See more details on the README.md file. The
> source code is also available on GitHub:
> https://github.com/prereview/rapid-prereview/


### Demoing the platform

This supposes that you have followed the instruction from the rest of this README.

##### First time

Suggested steps:
1. Start the local services using `docker-compose -f .devcontainer/docker-compose.yml up`.
2. In a shell attached to the 'web' container:
   - run `npm run seed` or `npm run reset` to either seed the database with
     sample data (or start from a clean state)
   - run `npm start` to start the web server
3. In another terminal, run `npm run extension:watch` and update the extension in
   your browser (see section above for instructions)
4. You can now visit [http://127.0.0.1:3000/](http://127.0.0.1:3000/) and give a demo

When you are done with the demo you can use `docker-compose down` to shut down the server.

##### Updating your local install

1. `cd` into this repository
2. run `git fetch` followed by `git merge origin/master`
3. Connect a shell to the web container and run `npm install`
4. Follow the First time instructions (see above)

### Storybook (components playground)

If you want to work on component in isolation run:

```sh
npm run storybook
```

and visit [http://127.0.0.1:3030/](http://127.0.0.1:3030/).

To add stories, add a file that ends with `.stories.js` in the `./src/components` directory.


### Tests

Once cloudant and redis are running run:

```sh
npm test
```

### Usage stats

Several CouchDB views can give access to usage statistics. For instance, logging
in to Cloudant and visiting
`/rapid-prereview-docs/_design/ddoc-docs/_view/byType?group_level=1` will report
a breakdown of the counts per types.

### Deployments

We use Azure and IBM Cloudant.

#### Architecture

We use [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/) and run 2 apps:
- `rapid-prereview` for the web server
- `rapid-prereview-service` for a process that takes care of:
  - maintaining our search index (listening to CouchDB changes feed)
  - updating the "trending" score of preprints with reviews or requests for
    reviews on a periodical interval

These 2 apps are run on the same service plan (`rapid-prereview-service-plan`).

The databases are hosted on IBM Cloudant (CouchDB) and are composed of 3
databases:
- `rapid-prereview-docs` (public) storing the roles, reviews and requests for reviews
- `rapid-prereview-users` (private) storing all the user data (and the links user <-> role)
- `rapid-prereview-index` (private) storing the preprint with reviews or request for
  reviews search index

We use [Azure Cache for
Redis](https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/) to store:
- session data
- cached data for the payload of the public API.

We use [Sendgrid (from the Azure
marketplace)](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/SendGrid.SendGrid)
for emails.

#### Process

##### Cloudant

**Be aware that all the following will source the production environment variables
(see the Azure section below for information to get them).**

1. Run `npm run cloudant:init` to create the databases and push the design documents
2. Run `npm run cloudant:set-security` to secure the databases
3. Run `npm run cloudant:get-security` to verify the [security
object](https://cloud.ibm.com/docs/services/Cloudant/offerings?topic=cloudant-authorization)

To update the design documents run: `npm run cloudant:ddocs`.

To seed the production database (for demos **only**) run: `npm run cloudant:seed`
**(!! note that this performs a hard reset and delete all data in the databases
before seeding)**.

To reset the production database (for demos **only**) run: `npm run
cloudant:reset` **(!! note that this performs a hard reset and delete all data in
the databases)**.

##### Azure

Visit https://portal.azure.com/ All the resources we used are defined in a
`rapid-prereview` resource group.

1. Install Azure CLI (see
   https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest)
2. Run `az login` to login to the CLI
3. Get the private files not checked in to GitHub: `./get-private.sh` (if you
   later update those files, run `./put-private.sh` to upload them back)
4. Run `npm run build` (after having run `npm install`)
5. Run `./deploy-app.sh` to deploy the app and `./deploy-service.sh` to deploy the service

To see the logs, run `./log-app.sh` or `./log-service.sh`. We use
[pino](https://getpino.io/) for logging.

Apps can be restarted with `./restart-app.sh` and `./restart-service.sh`.

To reset the redis cache run: `npm run azure:reset-cache`. **Be aware that this
will source the production environment variables.**

To reset all redis data (including sessions) run: `npm run
azure:reset-redis`. **Be aware that this will source the production environment
variables.**

Some basic info about the service health can be found at https://rapid-prereview-service.azurewebsites.net/

#### Backups

Backups are stored in a blob storage container on azure.

1. Install Azure CLI (see
   https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest)
2. Run `az login` to login to the CLI
3. Run `npm run backup` **Be aware that this will source the production
  environment variables.**
