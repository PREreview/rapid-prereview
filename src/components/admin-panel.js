import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { MdClose } from 'react-icons/md';
import { useUser } from '../contexts/user-context';
import { getId, unprefix } from '../utils/jsonld';
import HeaderBar from './header-bar';
import { ORG } from '../constants';
import { createModeratorQs } from '../utils/search';
import { useRolesSearchResults, usePostAction } from '../hooks/api-hooks';
import Button from './button';
import IconButton from './icon-button';
import { RoleBadgeUI } from './role-badge';
import LabelStyle from './label-style';
import Modal from './modal';
import TextInput from './text-input';
import Controls from './controls';

export default function AdminPanel() {
  const [user] = useUser();
  const [bookmark, setBookmark] = useState(null);

  const search = createModeratorQs({ bookmark });

  const [results, progress] = useRolesSearchResults(search, !!bookmark);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [revokeRole, setRevokeRole] = useState(null);

  const [excluded, setExcluded] = useState(new Set());
  const [added, setAdded] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="admin-panel">
      <Helmet>
        <title>{ORG} • Admin panel</title>
      </Helmet>
      <HeaderBar closeGap />

      <section>
        <header className="admin-panel__header">
          <span>Manage moderators</span>
          <Button
            primary={true}
            onClick={() => {
              setIsAddModalOpen(true);
            }}
          >
            Add moderator
          </Button>
        </header>

        {results.total_rows === 0 && !progress.isActive && !added.length ? (
          <div>No moderators.</div>
        ) : (
          <div>
            <ul className="admin-panel__card-list">
              {added
                .concat(
                  results.rows
                    .map(row => row.doc)
                    .filter(
                      role =>
                        !excluded.has(getId(role)) &&
                        !added.some(_role => getId(_role) === getId(role))
                    )
                )
                .map(role => (
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
                      <IconButton
                        className="admin-panel__remove-button"
                        onClick={() => {
                          setRevokeRole(role);
                        }}
                      >
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

      {isAddModalOpen && (
        <AdminPanelAddModal
          user={user}
          onClose={() => {
            setIsAddModalOpen(false);
          }}
          onSuccess={action => {
            setAdded(added.concat(action.result));
          }}
        />
      )}

      {!!revokeRole && (
        <AdminPanelRemoveModal
          user={user}
          role={revokeRole}
          onClose={() => {
            setRevokeRole(null);
          }}
          onSuccess={action => {
            setExcluded(
              new Set(Array.from(excluded).concat(getId(action.result)))
            );
          }}
        />
      )}
    </div>
  );
}

function AdminPanelAddModal({ user, onClose, onSuccess }) {
  const [value, setValue] = useState('');
  const [post, postProgress] = usePostAction();
  const [frame, setFrame] = useState('input');

  const pattern =
    '^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$'; // uuid v4
  const re = new RegExp(pattern, 'i');

  return (
    <Modal title="Add Moderator">
      <div className="admin-panel-add-modal">
        {frame === 'input' ? (
          <Fragment>
            <TextInput
              inputId="step-preprint-input-new"
              label={<span>Enter a role (persona) ID</span>}
              minimal={true}
              autoComplete="off"
              disabled={postProgress.isActive}
              placeholder=""
              pattern={pattern}
              onChange={e => {
                const value = e.target.value;
                setValue(value);
              }}
              value={value}
            />

            <Controls error={postProgress.error}>
              <Button
                disabled={postProgress.isActive}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={postProgress.isActive || !re.test(value)}
                isWaiting={postProgress.isActive}
                onClick={() => {
                  post(
                    {
                      '@type': 'GrantModeratorRoleAction',
                      actionStatus: 'CompletedActionStatus',
                      agent: getId(user),
                      object: `role:${value}`
                    },
                    body => {
                      setFrame('success');
                      onSuccess(body);
                    }
                  );
                }}
              >
                Add
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>
              The role (persona) was successfully granted moderator permission.
            </p>

            <Controls error={postProgress.error}>
              <Button
                disabled={postProgress.isActive}
                onClick={() => {
                  onClose();
                }}
              >
                Close
              </Button>
            </Controls>
          </Fragment>
        )}
      </div>
    </Modal>
  );
}

AdminPanelAddModal.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

function AdminPanelRemoveModal({ user, role, onClose, onSuccess }) {
  const [post, postProgress] = usePostAction();
  const [frame, setFrame] = useState('submit');

  return (
    <Modal title="Revoke Moderator Permission">
      <div className="admin-panel-remove-modal">
        {frame === 'submit' ? (
          <Fragment>
            <p>
              Are you sure to want to revoke moderator permission for role
              (persona) <em>{role.name || unprefix(getId(role))}</em>?
            </p>

            <Controls error={postProgress.error}>
              <Button
                disabled={postProgress.isActive}
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={postProgress.isActive}
                isWaiting={postProgress.isActive}
                onClick={() => {
                  post(
                    {
                      '@type': 'RevokeModeratorRoleAction',
                      actionStatus: 'CompletedActionStatus',
                      agent: getId(user),
                      object: getId(role)
                    },
                    body => {
                      setFrame('success');
                      onSuccess(body);
                    }
                  );
                }}
              >
                Revoke
              </Button>
            </Controls>
          </Fragment>
        ) : (
          <Fragment>
            <p>
              The moderator permission was successfuly revoked for role
              (persona) <em>{role.name || unprefix(getId(role))}</em>.
            </p>

            <Controls error={postProgress.error}>
              <Button
                disabled={postProgress.isActive}
                onClick={() => {
                  onClose();
                }}
              >
                Close
              </Button>
            </Controls>
          </Fragment>
        )}
      </div>
    </Modal>
  );
}

AdminPanelRemoveModal.propTypes = {
  user: PropTypes.object.isRequired,
  role: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};
