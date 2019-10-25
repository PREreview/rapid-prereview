import React from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import { MdClear } from 'react-icons/md';
import { MenuItem } from '@reach/menu-button';
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
export function PotentialRoles({ roleIds = [], onRemoved }) {
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
      <p className="role-list__tip-text">Reviewers</p>

      {!!roleIds.length && (
        <ul className="role-list__list">
          {roleIds.map(roleId => (
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
              </DraggableRoleBadge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

PotentialRoles.propTypes = {
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
    <RoleBadge
      ref={dragRef}
      roleId={roleId}
      className={classNames('draggable-role-badge', {
        'draggable-role-badge--dragging': isDragging
      })}
    >
      {children}
    </RoleBadge>
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
export function HighlightedRoles({ roleIds = [], onRemoved }) {
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
          <span>Viewing All (Drag {`&`} drop bades to filter reviews)</span>
        )}
      </p>
      <ul className="role-list__list">
        {!!roleIds.length &&
          roleIds.map(roleId => (
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
              </DraggableRoleBadge>
            </li>
          ))}
      </ul>
      <IconButton
        className="role-list__clear-button"
        onClick={() => {
          onRemoved(roleIds);
        }}
      >
        <MdClear className="role-list__clear-button__icon" />
      </IconButton>
    </div>
  );
}

HighlightedRoles.propTypes = {
  roleIds: PropTypes.arrayOf(PropTypes.string),
  onRemoved: PropTypes.func.isRequired
};
