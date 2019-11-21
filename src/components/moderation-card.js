import React, { Fragment, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
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

export default function ModerationCard({ user, reviewAction }) {
  const [isOpened, setIsOpened] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reports = getActiveReports(reviewAction);
  const textAnswers = getTextAnswers(reviewAction);

  return (
    <div>
      {/* The card body */}
      <div>
        <RoleBadge roleId={getId(reviewAction.agent)} />
        reviewed on{' '}
        <span>{format(new Date(reviewAction.startTime), 'MMM. d, yyyy')}</span>
        <dl>
          {textAnswers.map(
            ({ questionId, question, answers: [{ text: answer }] }) => (
              <div key={questionId}>
                <dt>
                  <Value>{question}</Value>
                </dt>
                <dd>
                  <Value>{answer}</Value>
                </dd>
              </div>
            )
          )}
        </dl>
      </div>

      {/* Expansion panel preview row */}
      <div>
        <span>
          {reports.length} report{reports.length > 1 ? 's' : ''}
        </span>

        <Value tagName="span">{reviewAction.object.name}</Value>

        {/* TODO current moderator badge* /}
        {/* @halmos TODO display role badge of the person currently moderating (and therefore locking the card)
            that needs more backend work but we can fake it with e.g.  <RoleBadge roleId={getId(reports[0].agent)} /> for now if you need static data
          */}

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
        {/* The moderation reason of each reporter */}
        <PreprintPreview preprint={reviewAction.object} />

        <h3>Report reasons</h3>

        <ul>
          {reports.map(report => (
            <li key={`${getId(report.agent)}-${report.startTime}`}>
              <RoleBadge roleId={getId(report.agent)} />
              <Value>{report.moderationReason || 'No reason specified'}</Value>
            </li>
          ))}
        </ul>

        <Controls>
          <Button
            primary={true}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Retract
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
      </Collapse>
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
