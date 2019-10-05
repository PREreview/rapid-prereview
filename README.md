# rapid-prereview

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


## Development

### Dependencies

run:

```sh
npm install
```


### Database (CouchDB 2.x + Clouseau + Dreyfus)

The simplest way to get that up and running locally is to use the
`cloudant-developer` docker container. To do so follow the instruction on:
https://hub.docker.com/r/ibmcom/cloudant-developer/

After installing docker run:

```sh
docker pull ibmcom/cloudant-developer
```

To start the container run:

```sh
docker run --detach --volume cloudant:/srv --name cloudant-developer --publish 5984:80 --hostname cloudant.dev ibmcom/cloudant-developer
```

The cloudant dashboard will be available at http://127.0.0.1:5984/dashboard.html

To restart the container after quiting Docker, run:
```sh
docker restart cloudant-developer
```

To stop the container and remove any previous one run:
```sh
docker rm `docker ps --no-trunc -aq` -f
```

To view the logs run:
```sh
docker logs cloudant-developer
```

### App

Once cloudant is running run:

```sh
npm run init
```

to setup the databases.

After, run:

```sh
npm start
```

and visit [http://127.0.0.1:3000/](http://127.0.0.1:3000/)

### Storybook

run:

```sh
npm run storybook
```

and visit [http://127.0.0.1:3030/](http://127.0.0.1:3030/).

To add stories, add a file that ends with `.stories.js` in the `./src/components` directory.
