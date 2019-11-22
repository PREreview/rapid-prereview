import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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

  // TODO set of exluded content

  const [results, progress] = useActionsSearchResults(search, !!bookmark);

  const [isOpenedMap, setIsOpenedMap] = useState(
    results.rows.reduce((map, row) => {
      map[getId(row.doc)] = false;
      return map;
    }, {})
  );
  useEffect(() => {
    setIsOpenedMap(
      results.rows.reduce((map, row) => {
        map[getId(row.doc)] = false;
        return map;
      }, {})
    );
  }, [results]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="moderate">
      <Helmet>
        <title>{ORG} • Moderate</title>
      </Helmet>
      <HeaderBar />

      <section>
        <header className="moderate__header">
          <span>Moderate Content</span>
          <span>{results.total_rows} Flagged Reviews</span>
        </header>

        {results.total_rows === 0 && !progress.isActive ? (
          <div>No reported reviews.</div>
        ) : (
          <div>
            <ul className="moderate__card-list">
              {results.rows.map(({ doc }) => (
                <li key={getId(doc)}>
                  <ModerationCard
                    user={user}
                    reviewAction={doc}
                    isOpened={isOpenedMap[getId(doc)] || false}
                    isLockedBy={undefined /* TODO wire */}
                    onOpen={() => {
                      setIsOpenedMap(
                        results.rows.reduce((map, row) => {
                          map[getId(row.doc)] = getId(row.doc) === getId(doc);
                          return map;
                        }, {})
                      );
                    }}
                    onSuccess={moderationAction => {
                      // TODO add a `exclude` params to the search qs so that we refresh the results in a safe way
                      console.log('moderationAction', moderationAction);
                    }}
                    onClose={() => {
                      setIsOpenedMap(
                        results.rows.reduce((map, row) => {
                          map[getId(row.doc)] = false;
                          return map;
                        }, {})
                      );
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          {/* Cloudant returns the same bookmark when it hits the end of the list */}
          {!!(
            results.rows.length < results.total_rows &&
            results.bookmark !== bookmark
          ) && (
            <Button
              onClick={e => {
                e.preventDefault();
                setBookmark(results.bookmark);
              }}
            >
              More
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
