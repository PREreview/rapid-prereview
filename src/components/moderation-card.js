import React, { useState } from 'react';
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

export default function ModerationCard({ reviewAction }) {
  const [isOpened, setIsOpened] = useState(false);

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
              console.log('TODO open retraction confirmation modal');
            }}
          >
            Retract
          </Button>
        </Controls>
      </Collapse>
    </div>
  );
}

ModerationCard.propTypes = {
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
