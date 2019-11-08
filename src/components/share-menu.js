import React, { Fragment, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
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
import Modal from './modal';
import Button from './button';
import Controls from './controls';
import XLink from './xlink';

export default function ShareMenu({ identifier, roleIds = [] }) {
  const [permalink, setPermalink] = useState(null);

  return (
    <Fragment>
      <Menu>
        <MenuButton className="share-menu">
          <VisuallyHidden>Share</VisuallyHidden>
          <MdShare className="share-menu__icon" />
        </MenuButton>
        <MenuList>
          <MenuItem
            onSelect={() => {
              setPermalink(`${process.env.API_URL}/${identifier}`);
            }}
          >
            Permalink
          </MenuItem>

          {!!(roleIds && roleIds.length) && (
            <MenuItem
              className="menu__list"
              onSelect={() => {
                const qs = new URLSearchParams();
                qs.set('role', roleIds.map(unprefix));

                setPermalink(
                  `${process.env.API_URL}/${identifier}?${qs.toString()}`
                );
              }}
            >
              Permalink (for selected user{roleIds.length > 1 ? 's' : ''})
            </MenuItem>
          )}

          <MenuLink
            className="menu__list__link-item"
            download="rapid-prereview-data.jsonld"
            href={`${process.env.API_URL}/api/preprint/${unprefix(
              createPreprintId(identifier)
            )}`}
          >
            Download data (JSON-LD)
          </MenuLink>
        </MenuList>
      </Menu>

      {!!permalink && (
        <PermalinkModal
          permalink={permalink}
          onClose={() => {
            setPermalink(null);
          }}
        />
      )}
    </Fragment>
  );
}

ShareMenu.propTypes = {
  identifier: PropTypes.string.isRequired,
  roleIds: PropTypes.arrayOf(PropTypes.string)
};

function PermalinkModal({ permalink, onClose }) {
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [status, setStatus] = useState({
    isActive: false,
    success: false,
    error: null
  });

  useEffect(() => {
    if (status.isActive) {
      copy(permalink)
        .then(() => {
          if (isMountedRef.current) {
            setStatus({ isActive: false, success: true, error: null });
          }
        })
        .catch(err => {
          if (isMountedRef.current) {
            setStatus({ isActive: false, success: false, error: err });
          }
        });
    } else if (status.success) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          setStatus({ isActive: false, success: false, error: null });
        }
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [status, permalink]);

  const url = new URL(permalink);
  return (
    <Modal
      title="Get permalink"
      showCloseButton={true}
      onClose={onClose}
      className="permalink-modal"
    >
      <XLink
        href={`${url.pathname}${url.search}${url.hash}`}
        to={{
          pathname: url.pathname,
          search: url.search,
          hash: url.hash
        }}
      >
        {permalink}
      </XLink>

      <Controls error={status.error}>
        <Button
          disabled={status.isActive || status.success}
          onClick={e => {
            setStatus({
              isActive: true,
              success: false,
              error: null
            });
          }}
        >
          {status.isActive
            ? 'Copying'
            : status.success
            ? 'Copied!'
            : ' Copy to clipboard'}
        </Button>
      </Controls>
    </Modal>
  );
}

PermalinkModal.propTypes = {
  permalink: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};
