import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MdChevronRight, MdFirstPage, MdClose } from 'react-icons/md';
import { useUser } from '../contexts/user-context';
import { getId, unprefix } from '../utils/jsonld';
import HeaderBar from './header-bar';
import { ORG } from '../constants';
import { createModeratorQs } from '../utils/search';
import { useRolesSearchResults } from '../hooks/api-hooks';
import Button from './button';
import IconButton from './icon-button';
import { RoleBadgeUI } from './role-badge';
import LabelStyle from './label-style';

export default function AdminPanel() {
  const [user] = useUser();
  const [bookmark, setBookmark] = useState(null);

  const search = createModeratorQs({ bookmark });

  const [results, progress] = useRolesSearchResults(search);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="admin-panel">
      <Helmet>
        <title>{ORG} • Admin panel</title>
      </Helmet>
      <HeaderBar />

      <section>
        <header className="admin-panel__header">
          <span>Manage moderators</span>
          <Button primary={true}>Add moderator</Button>
        </header>

        {results.total_rows === 0 && !progress.isActive ? (
          <div>No moderators.</div>
        ) : (
          <div>
            <ul className="admin-panel__card-list">
              {results.rows.map(({ doc: role }) => (
                <li key={getId(role)} className="admin-panel__card-list-item">
                  <div className="admin-panel__card-list-item__left">
                    <RoleBadgeUI role={role} />
                    <span>{role.name || unprefix(getId(role))}</span>
                  </div>
                  <div className="admin-panel__card-list-item__right">
                    <LabelStyle>
                      {role['@type'] === 'AnonymousReviewerRole'
                        ? 'Anonymous'
                        : 'Public'}
                    </LabelStyle>
                    <IconButton className="admin-panel__remove-button">
                      <MdClose className="admin-panel__remove-button-icon" />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="admin-panel__page-nav">
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
