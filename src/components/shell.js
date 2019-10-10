import React, {
  Fragment,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import PropTypes from 'prop-types';
import { MdDragHandle } from 'react-icons/md';
import IconButton from './icon-button';

export default function Shell({ children }) {
  const [isDown, setIsDown] = useState(false);
  const nextMaxHeightRef = useRef(null);
  const needForRafRef = useRef(true);
  const rafIdRef = useRef(null);

  // shell height is set in `vh` units through the `max-height` CSS property
  const [maxHeight, setMaxHeight] = useState(50);

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

        nextMaxHeightRef.current = nextMaxHeight;

        if (needForRafRef.current) {
          needForRafRef.current = false; // no need to call rAF up until next frame
          rafIdRef.current = requestAnimationFrame(resizeShell);
        }
      }
    }

    // callback for rAF
    function resizeShell() {
      needForRafRef.current = true;
      if (nextMaxHeightRef.current != null && nextMaxHeightRef.current > 10) {
        setMaxHeight(nextMaxHeightRef.current);
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
  }, [isDown]);

  const handleMouseDown = useCallback(e => {
    setIsDown(true);
  }, []);

  return (
    <Fragment>
      <div className="shell" style={{ maxHeight: `${maxHeight}vh` }}>
        <IconButton className="shell__drag" onMouseDown={handleMouseDown}>
          <MdDragHandle />
        </IconButton>

        {children}
      </div>

      {/* !! the Shell is typically over an iframe or object from a different origin => we can't get access to mousemove and mouseup event when user position mouse in this area => as a workaround we add a tranparant mask to be able to track mouse positions when the user resize the shell  */}
      {isDown && <div className="shell__mask"></div>}
    </Fragment>
  );
}

Shell.propTypes = {
  children: PropTypes.any
};
