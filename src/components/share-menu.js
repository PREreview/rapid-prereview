import React, { Fragment, useState, useEffect, useRef } from 'react';
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
import Modal from './modal';
import Button from './button';
import Controls from './controls';

export default function ShareMenu({ identifier, roleIds = [] }) {
  const [permalink, setPermalink] = useState(null);

  return (
    <Fragment>
      <Menu>
        <MenuButton>
          <VisuallyHidden>Share</VisuallyHidden>
          <MdShare />
        </MenuButton>
        <MenuList>
          <MenuItem
            onSelect={() => {
              setPermalink(`${window.location.origin}/${identifier}`);
            }}
          >
            Permalink (all reviews)
          </MenuItem>

          {!!(roleIds && roleIds.length) && (
            <MenuItem
              onSelect={() => {
                const qs = new URLSearchParams();
                qs.set('role', roleIds.map(unprefix));

                setPermalink(
                  `${window.location.origin}/${identifier}?${qs.toString()}`
                );
              }}
            >
              Permalink (for selected user{roleIds.length > 1 ? 's' : ''})
            </MenuItem>
          )}

          <MenuLink
            download="rapid-prereview-data.jsonld"
            href={`/api/preprint/${unprefix(createPreprintId(identifier))}`}
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
      }, 500);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [status, permalink]);

  const url = new URL(permalink);
  return (
    <Modal title="Get permalink" showCloseButton={true} onClose={onClose}>
      <Link
        to={{
          pathname: url.pathname,
          search: url.search,
          hash: url.hash
        }}
      >
        {permalink}
      </Link>

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
