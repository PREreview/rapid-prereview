import React, { useState } from 'react';
import Collapse from './collapse';

export default { title: 'Collapse' };

export function StartClosed() {
  const [isOpened, setState] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setState(!isOpened);
        }}
      >
        toggle
      </button>
      <Collapse isOpened={isOpened}>
        <div
          style={{
            backgroundColor: 'red',
            height: '300px'
          }}
        >
          isOpened: {isOpened.toString()}
        </div>
      </Collapse>
    </div>
  );
}

export function StartOpened() {
  const [isOpened, setState] = useState(true);

  return (
    <div>
      <button
        onClick={() => {
          setState(!isOpened);
        }}
      >
        toggle
      </button>
      <Collapse isOpened={isOpened}>
        <div
          style={{
            backgroundColor: 'red',
            height: '300px'
          }}
        >
          isOpened: {isOpened.toString()}
        </div>
      </Collapse>
    </div>
  );
}
