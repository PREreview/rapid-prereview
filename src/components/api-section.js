import React, { useState, useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import PropTypes from 'prop-types';
import Button from './button';
import IconButton from './icon-button';
import { createError } from '../utils/errors';
import Controls from './controls';
import { CSS_HEADER_HEIGHT } from '../constants';

export default function APISection({ id, title, children }) {
  const ref = useRef();
  const [run, setRun] = useState(false);
  const [data, setData] = useState({
    body: null,
    isActive: false,
    error: null
  });

  useEffect(() => {
    if (run) {
      const controller = new AbortController();

      setData({
        body: null,
        isActive: true,
        error: null
      });

      fetch(`/api/demo?key=demo:${id}`, {
        method: 'GET',
        signal: controller.signal
      })
        .then(resp => {
          if (resp.ok) {
            return resp.json();
          } else {
            return resp.json().then(
              body => {
                throw createError(resp.status, body.description || body.name);
              },
              err => {
                throw createError(resp.status, 'something went wrong');
              }
            );
          }
        })
        .then(body => {
          setData({
            body,
            isActive: false,
            error: null
          });
          if (ref.current) {
            window.scroll({
              top: Math.max(
                ref.current.getBoundingClientRect().top +
                  window.scrollY -
                  CSS_HEADER_HEIGHT -
                  120,
                0
              ),
              left: 0,
              behavior: 'smooth'
            });
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setData({
              body: null,
              isActive: false,
              error: err
            });
          }
        });

      return () => {
        controller.abort();
      };
    }
  }, [id, run]);

  return (
    <section className="api-section">
      <header>
        <h2 id={id}>{title}</h2>

        <Button
          isWaiting={data.isActive}
          disabled={run || data.isActive}
          primary={true}
          onClick={() => {
            setRun(true);
          }}
        >
          Run
        </Button>
      </header>

      {children}

      {!!data.body && run && !data.isActive && (
        <div className="api-section__payload-viewer" ref={ref}>
          <pre>
            <code>{JSON.stringify(data.body, null, 2)}</code>
          </pre>

          <IconButton
            onClick={() => {
              setRun(false);
            }}
          >
            <MdClose />
          </IconButton>
        </div>
      )}

      <Controls error={data.error} />
    </section>
  );
}

APISection.propTypes = {
  id: PropTypes.oneOf([
    'get-review',
    'get-request',
    'get-user',
    'get-role',
    'get-question',
    'search-role',
    'search-action'
  ]).isRequired,
  title: PropTypes.any.isRequired,
  children: PropTypes.any.isRequired
};
