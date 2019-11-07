import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function API() {
  return (
    <article>
      <Helmet>
        <title>Rapid PREreview • API documentation</title>
      </Helmet>

      <h1>Public API documentation</h1>

      <section>
        <h2 id="get-review">
          GET <code>/api/review/:id</code>
        </h2>
      </section>

      <section>
        <h2 id="search-reviews">
          GET <code>/api/review</code>
        </h2>
      </section>

      <section>
        <h2 id="get-request">
          GET <code>/api/request/:id</code>
        </h2>
      </section>

      <section>
        <h2 id="search-requests">
          GET <code>/api/request</code>
        </h2>
      </section>

      <section>
        <h2 id="get-user">
          GET <code>/api/user/:id</code>
        </h2>
      </section>

      <section>
        <h2 id="get-role">
          GET <code>/api/role/:id</code>
        </h2>
      </section>

      <section>
        <h2 id="replication">Replication</h2>
      </section>
    </article>
  );
}
