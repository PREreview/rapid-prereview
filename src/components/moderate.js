import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MdChevronRight, MdFirstPage } from 'react-icons/md';
import { useUser } from '../contexts/user-context';
import { getId } from '../utils/jsonld';
import HeaderBar from './header-bar';
import { ORG } from '../constants';
import { createModerationQs } from '../utils/search';
import { useActionsSearchResults } from '../hooks/api-hooks';
import Button from './button';
import ModerationCard from './moderation-card';

export default function Moderate() {
  const [user] = useUser();
  const [bookmark, setBookmark] = useState(null);

  const search = createModerationQs({ bookmark });

  const [results, progress] = useActionsSearchResults(search);

  return (
    <div className="moderate">
      <Helmet>
        <title>{ORG} • Moderate</title>
      </Helmet>
      <HeaderBar />

      <section>
        {results.total_rows === 0 && !progress.isActive ? (
          <div>No activity yet.</div>
        ) : bookmark && results.bookmark === bookmark && !progress.isActive ? (
          <div>No more activity.</div>
        ) : (
          <div>
            <ul>
              {results.rows.map(({ doc }) => (
                <li key={getId(doc)}>
                  <ModerationCard user={user} reviewAction={doc} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          {/* Cloudant returns the same bookmark when it hits the end of the list */}
          {!!bookmark && (
            <Button
              onClick={() => {
                setBookmark(null);
              }}
            >
              <MdFirstPage /> First page
            </Button>
          )}

          {!!(
            results.rows.length < results.total_rows &&
            results.bookmark !== bookmark
          ) && (
            <Button
              onClick={() => {
                setBookmark(results.bookmark);
              }}
            >
              Next Page <MdChevronRight />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
