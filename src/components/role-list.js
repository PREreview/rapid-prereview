import React from 'react';
import PropTypes from 'prop-types';
import RoleBadge from './role-badge';
import { useDrag } from 'react-dnd';

export default function RoleList({ roleIds = [] }) {
  if (!roleIds || !roleIds.length) return null;

  return (
    <ul>
      {roleIds.map(roleId => (
        <li key={roleId}>
          <DraggableRoleBadge roleId={roleId} />
        </li>
      ))}
    </ul>
  );
}

RoleList.propTypes = {
  roleIds: PropTypes.arrayOf(PropTypes.string)
};

function DraggableRoleBadge({ roleId }) {
  const [{ isDragging }, dragRef] = useDrag({
    item: { roleId, type: 'TYPE' },
    end(item, monitor) {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        let alertMessage = '';
        const isDropAllowed =
          dropResult.allowedDropEffect === 'any' ||
          dropResult.allowedDropEffect === dropResult.dropEffect;
        if (isDropAllowed) {
          const isCopyAction = dropResult.dropEffect === 'copy';
          const actionName = isCopyAction ? 'copied' : 'moved';
          alertMessage = `You ${actionName} ${item.name} into ${dropResult.name}!`;
        } else {
          alertMessage = `You cannot ${dropResult.dropEffect} an item into the ${dropResult.name}`;
        }
        alert(alertMessage);
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  console.log({ isDragging });

  //  return (
  //    <div ref={dragRef} roleId={roleId}>
  //      {roleId}
  //    </div>
  //  );

  return <RoleBadge ref={dragRef} roleId={roleId} />;
}

DraggableRoleBadge.propTypes = {
  roleId: PropTypes.string.isRequired
};
