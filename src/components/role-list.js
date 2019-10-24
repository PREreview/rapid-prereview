import React from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { MenuItem } from '@reach/menu-button';
import RoleBadge from './role-badge';
import Button from './button';

const ITEM_TYPE = Symbol('dnd:role');

export function DraggableRoleList({ roleIds = [], onRemoved }) {
  return (
    <div>
      {!!roleIds.length && (
        <ul>
          {roleIds.map(roleId => (
            <li key={roleId}>
              <DraggableRoleBadge
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

      <p>Drag persona to highlight</p>
    </div>
  );
}

DraggableRoleList.propTypes = {
  onRemoved: PropTypes.func.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.string)
};

function DraggableRoleBadge({ roleId, onDropped, children }) {
  const [{ isDragging }, dragRef] = useDrag({
    item: { roleId, type: ITEM_TYPE },
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
    <RoleBadge ref={dragRef} roleId={roleId}>
      {children}
    </RoleBadge>
  );
}

DraggableRoleBadge.propTypes = {
  roleId: PropTypes.string.isRequired,
  onDropped: PropTypes.func.isRequired,
  children: PropTypes.any
};

export function DroppableRoleList({ roleIds = [], onRemoved }) {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: ITEM_TYPE,
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  return (
    <div ref={dropRef}>
      {!!roleIds.length && (
        <ul>
          {roleIds.map(roleId => (
            <li key={roleId}>
              <RoleBadge roleId={roleId}>
                <MenuItem
                  onSelect={() => {
                    onRemoved([roleId]);
                  }}
                >
                  Remove
                </MenuItem>
              </RoleBadge>
            </li>
          ))}
        </ul>
      )}

      <p>Drop persona to highlight here</p>

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

DroppableRoleList.propTypes = {
  roleIds: PropTypes.arrayOf(PropTypes.string),
  onRemoved: PropTypes.func.isRequired
};
