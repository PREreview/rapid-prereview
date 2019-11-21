import React, { Fragment, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MdExpandLess, MdExpandMore, MdLock } from 'react-icons/md';
import { format } from 'date-fns';
import { getId } from '../utils/jsonld';
import Collapse from './collapse';
import IconButton from './icon-button';
import Value from './value';
import Controls from './controls';
import Button from './button';
import PreprintPreview from './preprint-preview';
import { getTextAnswers, getActiveReports } from '../utils/stats';
import RoleBadge from './role-badge';
import Modal from './modal';
import { usePostAction } from '../hooks/api-hooks';
import { useRole } from '../hooks/api-hooks';

export default function ModerationCard({ user, reviewAction }) {
  const [isOpened, setIsOpened] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, fetchRoleProgress] = useRole(reviewAction.agent);

  const reports = getActiveReports(reviewAction);
  const textAnswers = getTextAnswers(reviewAction);

  /* !TODO: @sballesteros wire the lock state of the card here */
  const isLocked = true;

  return (
    <div
      className={classNames('moderation-card', {
        'moderation-card--locked': isLocked
      })}
    >
      {/* The card body */}
      <div className="moderation-card__header">
        <div className="moderation-card__header__left">
          <RoleBadge
            roleId={getId(reviewAction.agent)}
            className="moderation-card__header-badge"
          />
          <span className="moderation-card__header-name">
            {role && role.name}
          </span>
        </div>
        <div className="moderation-card__header__right">
          Reviewed on{' '}
          <span>
            {format(new Date(reviewAction.startTime), 'MMM. d, yyyy')}
          </span>
        </div>
      </div>
      <div className="moderation-card__text-answers">
        <dl className="moderation-card__text-answers-list">
          {textAnswers.map(
            ({ questionId, question, answers: [{ text: answer }] }) => (
              <div key={questionId} className="moderation-card__text-answer">
                <dt className="moderation-card__text-answer-question">
                  <Value>{question}</Value>
                </dt>
                <dd className="moderation-card__text-answer-response">
                  <Value>{answer}</Value>
                </dd>
              </div>
            )
          )}
        </dl>
      </div>

      {/* Expansion panel preview row */}
      <div className="moderation-card__expansion-preview">
        <div className="moderation-card__expansion-preview__left">
          <span className="moderation-card__expansion-preview-count">
            {reports.length} Report{reports.length > 1 ? 's' : ''}
          </span>
          {` `}
          <Value
            tagName="span"
            className="moderation-card__expansion-preview-title"
          >
            {reviewAction.object.name}
          </Value>
        </div>

        <IconButton
          className="preprint-card__expansion-toggle"
          onClick={e => {
            setIsOpened(!isOpened);
          }}
        >
          {isOpened ? <MdExpandLess /> : <MdExpandMore />}
        </IconButton>
      </div>

      <Collapse isOpened={isOpened}>
        <div className="moderation-card__expansion-content">
          {/* The moderation reason of each reporter */}
          <PreprintPreview preprint={reviewAction.object} />

          <h3 className="moderation-card__sub-title">User Reports</h3>

          <ul className="moderation-card__flag-reasons-list">
            {reports.map(report => (
              <li
                key={`${getId(report.agent)}-${report.startTime}`}
                className="moderation-card__flag-reasons-list-item"
              >
                <RoleBadge roleId={getId(report.agent)} />
                <Value className="moderation-card__flag-reason">
                  {report.moderationReason || 'No reason specified'}
                </Value>
              </li>
            ))}
          </ul>

          <Controls className="moderation-card__expansion-controls">
            <Button
              primary={true}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Block user
            </Button>
            <Button
              primary={true}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Retract review
            </Button>
            <Button
              primary={true}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Ignore report
            </Button>

            {isModalOpen && (
              <ModerationCardModal
                user={user}
                reviewAction={reviewAction}
                onClose={() => {
                  setIsModalOpen(false);
                }}
              />
            )}
          </Controls>
        </div>
      </Collapse>
      {isLocked && (
        <div className="moderation-card__lock-overlay">
          <div className="moderation-card__lock-overal__content">
            <div className="moderation-card__lock-overlay__lock-icon-container">
              <MdLock className="moderation-card__lock-overlay__lock-icon" />
            </div>
            <span className="moderation-card__lock-overlay__message">
              This report is currently being reviewed by another moderator.
            </span>
            {/*!TODO: @sballesteros wire the badge here */}
            <span className="moderation-card__lock-overlay__agent">
              <RoleBadge roleId={getId(reports[0].agent)} />
              <span className="moderation-card__lock-overlay__agent-name">
                [Moderator Name]
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

ModerationCard.propTypes = {
  user: PropTypes.object.isRequired,
  reviewAction: PropTypes.shape({
    '@type': PropTypes.oneOf(['RapidPREreviewAction']).isRequired,
    agent: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    object: PropTypes.shape({
      name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
    }).isRequired,
    moderationAction: PropTypes.arrayOf(
      PropTypes.shape({
        '@type': PropTypes.oneOf([
          'ReportRapidPREreviewAction',
          'IgnoreReportRapidPREreviewAction',
          'ModerateRapidPREreviewAction'
        ]).isRequired,
        moderationReason: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.object
        ])
      })
    ).isRequired
  }).isRequired
};

function ModerationCardModal({ onClose, reviewAction, user }) {
  const [frame, setFrame] = useState('action');
  const [post, postProgress] = usePostAction();
  const ref = useRef();

  return (
    <Modal title="Retract review">
      {frame === 'action' ? (
        <Fragment>
          <p>
            Retracting the review will prevent reader to see its content or
            existence.
          </p>

          <label htmlFor="retraction-reason">Retraction Reason</label>

          <textarea
            ref={ref}
            id="retraction-reason"
            name="moderationReason"
            rows="4"
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
              disabled={postProgress.isActive}
              isWaiting={postProgress.isActive}
              onClick={() => {
                post(
                  {
                    '@type': 'ModerateRapidPREreviewAction',
                    actionStatus: 'CompletedActionStatus',
                    agent: getId(user.defaultRole),
                    object: getId(reviewAction),
                    moderationReason: ref.current.value
                  },
                  body => {
                    setFrame('success');
                  }
                );
              }}
            >
              Confirm
            </Button>
          </Controls>
        </Fragment>
      ) : (
        <Fragment>
          <p>Success: the review has now been retracted.</p>

          <Controls>
            <Button
              onClick={() => {
                onClose();
              }}
            >
              Close
            </Button>
          </Controls>
        </Fragment>
      )}
    </Modal>
  );
}
ModerationCardModal.propTypes = {
  user: PropTypes.object.isRequired,
  reviewAction: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};
