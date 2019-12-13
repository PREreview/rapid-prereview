import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import { MdClear } from 'react-icons/md';
import { MenuItem } from '@reach/menu-button';
import { getId, arrayify } from '../utils/jsonld';
import RoleBadge from './role-badge';
import IconButton from './icon-button';

// !! there is currently a bug in chrome for DnD over an inline PDF (dragover events are not emitted)
// see https://bugs.chromium.org/p/chromium/issues/detail?id=984891&q=drag%20object&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified

const POTENTIAL_ROLE_TYPE = Symbol('dnd:potential-role-type');
const HIGHLIGHTED_ROLE_TYPE = Symbol('dnd:highlighted-role-type');

/**
 * Allow roles to be dragged to `HighlightedRoles`.
 * Note: this is also a drop zone for the `HighlightedRoles`
 * so that dragged role can be dragged back
 */
export function PotentialRoles({
  role,
  actions,
  roleIds = [],
  onRemoved,
  onModerate,
  canModerate,
  isModerationInProgress
}) {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: HIGHLIGHTED_ROLE_TYPE,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  return (
    <div
      className={classNames('role-list role-list--potential', {
        'role-list--can-drop': canDrop,
        'role-list--is-over': isOver
      })}
      ref={dropRef}
    >
      {!roleIds.length && <p className="role-list__tip-text">No Reviewers</p>}

      <ul className="role-list__list">
        {roleIds.map(roleId => {
          const action = actions.find(action => getId(action.agent) === roleId);

          return (
            <li key={roleId}>
              <DraggableRoleBadge
                type={POTENTIAL_ROLE_TYPE}
                roleId={roleId}
                onDropped={roleId => {
                  onRemoved(roleId);
                }}
              >
                <MenuItem
                  onSelect={() => {
                    onRemoved(roleId);
                  }}
                >
                  Add to selection
                </MenuItem>

                {!!canModerate && !!action && (
                  <MenuItem
                    disabled={
                      isModerationInProgress ||
                      arrayify(action.moderationAction).some(
                        action =>
                          action['@type'] === 'ReportRapidPREreviewAction' &&
                          getId(action.agent) === getId(role)
                      )
                    }
                    onSelect={() => {
                      onModerate(getId(action));
                    }}
                  >
                    Report Review
                  </MenuItem>
                )}
              </DraggableRoleBadge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

PotentialRoles.propTypes = {
  role: PropTypes.object,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      '@type': PropTypes.oneOf(['RapidPREreviewAction']).isRequired,
      actionStatus: PropTypes.oneOf(['CompletedActionStatus']).isRequired,
      agent: PropTypes.string.isRequired,
      moderationAction: PropTypes.arrayOf(
        PropTypes.shape({
          '@type': PropTypes.oneOf([
            // !! `ModerateRapidPREreviewAction` cannot be present reviews with it must be excluded upstream
            'ReportRapidPREreviewAction',
            'IgnoreReportRapidPREreviewAction'
          ]).isRequired
        })
      )
    })
  ).isRequired,

  canModerate: PropTypes.bool,
  onModerate: PropTypes.func.isRequired,
  isModerationInProgress: PropTypes.bool,
  onRemoved: PropTypes.func.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.string)
};

function DraggableRoleBadge({ roleId, onDropped, children, type }) {
  const [{ isDragging }, dragRef] = useDrag({
    item: { roleId, type },
    end(item, monitor) {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onDropped(item.roleId);
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <Fragment>
      <RoleBadge
        tooltip={true}
        ref={dragRef}
        roleId={roleId}
        className={classNames('draggable-role-badge', {
          'draggable-role-badge--dragging': isDragging
        })}
      >
        {children}
      </RoleBadge>
    </Fragment>
  );
}

DraggableRoleBadge.propTypes = {
  roleId: PropTypes.string.isRequired,
  onDropped: PropTypes.func.isRequired,
  children: PropTypes.any,
  type: PropTypes.oneOf([POTENTIAL_ROLE_TYPE, HIGHLIGHTED_ROLE_TYPE])
};

/**
 * This act as a drop target for the `PotentialRoles`
 * Note: this is also a draggable so that dragged role can be dragged back to
 *`PotentialRoles`
 */
export function HighlightedRoles({
  role,
  actions,
  roleIds = [],
  onRemoved,
  onModerate,
  canModerate,
  isModerationInProgress
}) {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: POTENTIAL_ROLE_TYPE,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  return (
    <div
      className={classNames('role-list role-list--highlighted', {
        'role-list--can-drop': canDrop,
        'role-list--is-over': isOver
      })}
      ref={dropRef}
    >
      <p className="role-list__tip-text">
        {roleIds.length ? (
          <span>Selected Reviewers</span>
        ) : (
          <span>Viewing all reviews</span>
        )}
      </p>
      <ul className="role-list__list">
        {roleIds.map(roleId => {
          const action = actions.find(action => getId(action.agent) === roleId);

          return (
            <li key={roleId}>
              <DraggableRoleBadge
                type={HIGHLIGHTED_ROLE_TYPE}
                roleId={roleId}
                onDropped={roleId => {
                  onRemoved([roleId]);
                }}
              >
                <MenuItem
                  onSelect={() => {
                    onRemoved([roleId]);
                  }}
                >
                  Remove
                </MenuItem>

                {!!canModerate && !!action && (
                  <MenuItem
                    disabled={
                      isModerationInProgress ||
                      arrayify(action.moderationAction).some(
                        action =>
                          action['@type'] === 'ReportRapidPREreviewAction' &&
                          getId(action.agent) === getId(role)
                      )
                    }
                    onSelect={() => {
                      onModerate(getId(action));
                    }}
                  >
                    Report Review
                  </MenuItem>
                )}
              </DraggableRoleBadge>
            </li>
          );
        })}
      </ul>
      {roleIds.length ? (
        <IconButton
          className="role-list__clear-button"
          onClick={() => {
            onRemoved(roleIds);
          }}
        >
          <MdClear className="role-list__clear-button__icon" />
        </IconButton>
      ) : (
        ''
      )}
    </div>
  );
}

HighlightedRoles.propTypes = {
  role: PropTypes.object,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      '@type': PropTypes.oneOf(['RapidPREreviewAction']).isRequired,
      actionStatus: PropTypes.oneOf(['CompletedActionStatus']).isRequired,
      agent: PropTypes.string.isRequired,
      moderationAction: PropTypes.arrayOf(
        PropTypes.shape({
          '@type': PropTypes.oneOf([
            // !! `ModerateRapidPREreviewAction` cannot be present reviews with it must be excluded upstream
            'ReportRapidPREreviewAction',
            'IgnoreReportRapidPREreviewAction'
          ]).isRequired
        })
      )
    })
  ).isRequired,
  canModerate: PropTypes.bool,
  onModerate: PropTypes.func.isRequired,
  isModerationInProgress: PropTypes.bool,
  roleIds: PropTypes.arrayOf(PropTypes.string),
  onRemoved: PropTypes.func.isRequired
};
