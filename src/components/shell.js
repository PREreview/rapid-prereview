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
import { MdDragHandle, MdUnfoldMore, MdUnfoldLess } from 'react-icons/md';
import IconButton from './icon-button';
import RapidPreReviewLogo from './rapid-pre-review-logo';

const SHELL_HEADER_HEIGHT = 40; // !! keep in sync with CSS

export default function Shell({ children, defaultStatus = 'default' }) {
  const [isDown, setIsDown] = useState(false);
  const ref = useRef();
  const nextHeightRef = useRef(null);
  const needForRafRef = useRef(true);
  const rafIdRef = useRef(null);

  // shell height is set in `%` units through the `max-height` CSS property
  const [height, setHeight] = useState(50);
  const [status, setStatus] = useState(defaultStatus);

  // reposition shell when user "drag" the handle
  useEffect(() => {
    function handleMouseUp(e) {
      if (isDown) {
        setIsDown(false);
      }
    }

    function handleTouchEnd(e) {
      if (isDown) {
        setIsDown(false);
      }
    }

    function handleTouchCancel(e) {
      if (isDown) {
        setIsDown(false);
      }
    }

    function handleChangeY(y) {
      // we compute the next max-height in `%` unit

      const nextMaxHeight = Math.min(
        Math.max(
          0,
          Math.max(SHELL_HEADER_HEIGHT, window.innerHeight - y) /
            window.innerHeight
        ) * 100,
        100
      );

      nextHeightRef.current = nextMaxHeight;

      if (needForRafRef.current) {
        needForRafRef.current = false; // no need to call rAF up until next frame
        rafIdRef.current = requestAnimationFrame(resizeShell);
      }
    }

    // we only track the mouse when the user maintains the mousedown
    // we use `requestAnimationFrame` (rAF) to debounce
    function handleMouseMove(e) {
      if (isDown) {
        handleChangeY(e.clientY);
      }
    }

    function handleTouchMove(e) {
      if (isDown) {
        // prevent scrolling of the PDF
        e.preventDefault();
        e.stopPropagation();
        const y = Math.max(...Array.from(e.touches, touch => touch.clientY), 0);
        handleChangeY(y);
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
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove, {
        passive: false
      });
      window.removeEventListener('touchcancel', handleTouchCancel);
      cancelAnimationFrame(rafIdRef.current);
      needForRafRef.current = true;
    };
  }, [isDown, status]);

  // Mimate the OSX shell effect
  useEffect(() => {
    function handle(y) {
      if (status === 'minimized' && y < SHELL_HEADER_HEIGHT) {
        setStatus('revealed');
      } else if (status === 'revealed' && y >= SHELL_HEADER_HEIGHT) {
        setStatus('minimized');
      }
    }

    function handleMouseMove(e) {
      const y = window.innerHeight - Math.max(e.clientY, 0);
      handle(y);
    }

    function handleTouchStart(e) {
      const y =
        window.innerHeight -
        Math.max(...Array.from(e.touches, touch => touch.clientY), 0);
      handle(y);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
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

  const handleTouchStart = useCallback(e => {
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
        style={status === 'positioned' ? { height: `${height}%` } : undefined}
      >
        <div className="shell__control-bar">
          <div className="shell__controls">
            <div className="shell__controls__left">
              <RapidPreReviewLogo short={true} />
            </div>
            <div className="shell__controls__center">
              <IconButton
                className="shell__controls__button shell__controls__button--drag"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={() => {
                  if (status !== 'positioned') {
                    setTransition('default');
                  }
                }}
              >
                <MdDragHandle className="shell__controls__button__icon" />
              </IconButton>
            </div>

            <div className="shell__controls__right">
              <IconButton
                className="shell__controls__button shell__controls__button--maximize"
                onClick={() => {
                  setTransition('maximized');
                }}
              >
                <div className="shell__controls__button__icon-container">
                  <MdUnfoldMore className="shell__controls__button__icon" />
                </div>
              </IconButton>

              <IconButton
                className="shell__controls__button"
                onClick={() => {
                  setTransition('minimized');
                }}
              >
                <div className="shell__controls__button__icon-container">
                  <MdUnfoldLess className="shell__controls__button__icon" />
                </div>
              </IconButton>
            </div>
          </div>
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
  children: PropTypes.func,
  defaultStatus: PropTypes.oneOf([
    'default',
    'minimized',
    'revealed',
    'maximized',
    'positioned'
  ])
};
