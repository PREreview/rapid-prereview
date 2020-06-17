# Tour of the PREreview Codebase

## Key concepts

<dl>
  <dt>Preprint</dt>
  <dd>An academic paper prior to formal review and publishing.</dd>
  <dt>Review</dt>
  <dd>PREreview's mission is to lower the barrier to entry for academic review of preprints.
  Reviews can be requested and submitted via the website.</dd>
</dl>

## Key libraries

* [React](https://reactjs.org/) The UI framework for the PREreview website.
* [Express.js](https://expressjs.com/) The web framework for the PREreview API; also supplies data to the website.

## Key services
* [Redis](https://redis.io/) Holds cached results for some operations.
* [CouchDB](https://couchdb.apache.org/) Primary "source of truth" for PREreview users, reviews, and other application state.

## External services
PREreview uses well-known preprint servers to find metadata and content for preprints, including:

- arXiv
- bioArxiv
- Crossref
- OpenAire
- Google Scholar
- DOI.org

Additionally, PREreview relies on [ORCid](https://orcid.org/) for user authentication.

# API
Documentation about the API is published as part of the application; https://outbreaksci.prereview.org/api/ .
This can be edited in `../src/components/api.js`.

# Database Structure

We divide PREreview data among CouchDB collections.
The design docs for these are stored in `../src/ddocs/`; see [CouchDB documentation](https://docs.couchdb.org/en/stable/ddocs/index.html) for more info on design docs.
Database queries are consolidated in `../src/db/db.js`.

## `rapid-prereview-docs`
Stores information about preprints retrieved from authoritative services.

## `rapid-prereview-users`
Stores information about users who have provided profile information for the site.

## `rapid-prereview-index`
Stores a partial copy of information from other collections for full-text indexing.