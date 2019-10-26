import React, {
  Fragment,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback
} from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {
  MdVerticalAlignBottom,
  MdVerticalAlignTop,
  MdDragHandle
} from 'react-icons/md';
import IconButton from './icon-button';

const SHELL_HEADER_HEIGHT = 56;

export default function Shell({ children }) {
  const [isDown, setIsDown] = useState(false);
  const ref = useRef();
  const nextHeightRef = useRef(null);
  const needForRafRef = useRef(true);
  const rafIdRef = useRef(null);

  // shell height is set in `vh` units through the `max-height` CSS property
  const [height, setHeight] = useState(50);
  const [status, setStatus] = useState('default'); // `minimized`, `revealed`, `maximized`, `positioned`

  useEffect(() => {
    function handleMouseUp(e) {
      if (isDown) {
        setIsDown(false);
      }
    }

    // we only track the mouse when the user maintains the mousedown
    // we use `requestAnimationFrame` (rAF) to debounce
    function handleMouseMove(e) {
      if (isDown) {
        // we compute the next max-height in `vh` unit
        const nextMaxHeight = Math.ceil(
          Math.max(
            0,
            (window.innerHeight - Math.max(e.clientY, 0)) / window.innerHeight
          ) * 100
        );

        nextHeightRef.current = nextMaxHeight;

        if (needForRafRef.current) {
          needForRafRef.current = false; // no need to call rAF up until next frame
          rafIdRef.current = requestAnimationFrame(resizeShell);
        }
      }
    }

    // callback for rAF
    function resizeShell() {
      needForRafRef.current = true;
      if (nextHeightRef.current != null) {
        if (status !== 'positioned') {
          setStatus('positioned');
        }
        setHeight(nextHeightRef.current);
      }
    }

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafIdRef.current);
      needForRafRef.current = true;
    };
  }, [isDown, status]);

  useEffect(() => {
    function handleMouseMove(e) {
      if (
        status === 'minimized' &&
        window.innerHeight - Math.max(e.clientY, 0) < SHELL_HEADER_HEIGHT
      ) {
        setStatus('revealed');
      } else if (
        status === 'revealed' &&
        window.innerHeight - Math.max(e.clientY, 0) >= SHELL_HEADER_HEIGHT
      ) {
        setStatus('minimized');
      }
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [status]);

  // Make transition from `height` to `max-height` work with CSS transitions
  const [transition, setTransition] = useState(null);
  useLayoutEffect(() => {
    const { style, offsetHeight } = ref.current;
    if (transition === 'default') {
      // set max-height so that the CSS transition works
      style.maxHeight = `${offsetHeight}px`;
      style.height = '';
      const rafId = requestAnimationFrame(() => {
        setStatus('default');
        setTransition(null);
        style.maxHeight = '';
      });

      return () => {
        cancelAnimationFrame(rafId);
      };
    } else if (transition) {
      if (status === 'default') {
        // set height so CSS transition works
        style.height = `${offsetHeight}px`;
        style.maxHeight = '';

        const rafId = requestAnimationFrame(() => {
          setStatus(transition);
          setTransition(null);
          style.height = '';
        });

        return () => {
          cancelAnimationFrame(rafId);
        };
      } else {
        setStatus(transition);
        setTransition(null);
      }
    }
  }, [status, transition]);

  const handleMouseDown = useCallback(e => {
    setIsDown(true);
  }, []);

  const onRequireScreen = useCallback(() => {
    if (status === 'minimized' || status === 'revealed') {
      setTransition('default');
    }
  }, [status]);

  return (
    <Fragment>
      <div
        ref={ref}
        className={classNames('shell', {
          'shell--default': status === 'default',
          'shell--revealed': status === 'revealed',
          'shell--minimized': status === 'minimized',
          'shell--maximized': status === 'maximized'
        })}
        style={status === 'positioned' ? { height: `${height}vh` } : undefined}
      >
        <div className="shell__controls">
          <IconButton
            onClick={() => {
              setTransition('minimized');
            }}
          >
            <MdVerticalAlignBottom />
          </IconButton>

          <IconButton
            onMouseDown={handleMouseDown}
            onClick={() => {
              if (status !== 'positioned') {
                setTransition('default');
              }
            }}
          >
            <MdDragHandle />
          </IconButton>

          <IconButton
            onClick={() => {
              setTransition('maximized');
            }}
          >
            <MdVerticalAlignTop />
          </IconButton>
        </div>

        {children(onRequireScreen)}
      </div>

      {/* !! the Shell is typically over an iframe or object from a different origin => we can't get access to mousemove and mouseup event when user position mouse in this area => as a workaround we add a tranparant mask to be able to track mouse positions when the user resize the shell  */}
      <div
        className={classNames('shell__mask', {
          'shell__mask--full': isDown
        })}
      ></div>
    </Fragment>
  );
}

Shell.propTypes = {
  children: PropTypes.func
};
