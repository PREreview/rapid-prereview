import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MdShare } from 'react-icons/md';
import copy from 'clipboard-copy';
import {
  Menu,
  MenuList,
  MenuButton,
  MenuLink,
  MenuItem
} from '@reach/menu-button';
import VisuallyHidden from '@reach/visually-hidden';
import { createPreprintId } from '../utils/ids';
import { unprefix } from '../utils/jsonld';

// TODO permalink open modal with a button to copy link to clipboard

export default function ShareMenu({ identifier, roleIds = [] }) {
  return (
    <Menu>
      <MenuButton>
        <VisuallyHidden>Share</VisuallyHidden>
        <MdShare />
      </MenuButton>
      <MenuList>
        <MenuItem
          onSelect={() => {
            copy(`${window.location.origin}/${identifier}`);
          }}
        >
          Permalink (all reviews)
        </MenuItem>

        {!!(roleIds && roleIds.length) && (
          <MenuLink as={Link} to={`/${identifier}`}>
            Permalink (for selected user{roleIds.length > 1 ? 's' : ''})
          </MenuLink>
        )}

        <MenuLink
          download="rapid-prereview-data.jsonld"
          href={`/api/preprint/${unprefix(createPreprintId(identifier))}`}
        >
          Download data (JSON-LD)
        </MenuLink>
      </MenuList>
    </Menu>
  );
}

ShareMenu.propTypes = {
  identifier: PropTypes.string.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.string)
};
