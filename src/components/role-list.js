import React from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import { MenuItem } from '@reach/menu-button';
import RoleBadge from './role-badge';
import Button from './button';

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
      className={classNames('potential-roles', {
        'potential-roles--can-drop': canDrop,
        'potential-roles--is-over': isOver
      })}
      ref={dropRef}
    >
      {!!roleIds.length && (
        <ul className="potential-roles__list">
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

      <p>Drag persona below to highlight (or drop back here to undo)</p>
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
      className={classNames('highlighted-roles', {
        'highlighted-roles--can-drop': canDrop,
        'highlighted-roles--is-over': isOver
      })}
      ref={dropRef}
    >
      {!!roleIds.length && (
        <ul className="highlighted-roles__list">
          {roleIds.map(roleId => (
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
      )}

      <p>Drop persona to highlight here (or drag above to undo)</p>

      <Button
        onClick={() => {
          onRemoved(roleIds);
        }}
      >
        Clear all
      </Button>
    </div>
  );
}

HighlightedRoles.propTypes = {
  roleIds: PropTypes.arrayOf(PropTypes.string),
  onRemoved: PropTypes.func.isRequired
};
