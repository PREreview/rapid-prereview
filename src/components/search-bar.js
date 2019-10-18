import React, { useRef } from 'react';
import { MdSearch } from 'react-icons/md';
import { useHistory, useLocation } from 'react-router-dom';
import { createPreprintQs } from '../utils/search';

export default function SearchBar() {
  const inputRef = useRef();
  const history = useHistory();
  const location = useLocation();

  function handleSubmit(value) {
    const search = createPreprintQs(
      {
        text: value || null
      },
      location.search
    );

    if (search !== location.search) {
      history.push({
        pathname: location.pathame,
        search
      });
    }
  }

  return (
    <div className="search-bar">
      <div className="search-bar__left-spacer" />
      <div className="search-bar__search-box">
        <input
          defaultValue={new URLSearchParams(location.search).get('q') || ''}
          ref={inputRef}
          type="text"
          className="search-bar__search-box__input"
          placeholder="Search reviewed preprints by DOI, arXiv ID or title"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSubmit(e.target.value);
            }
          }}
          onBlur={e => {
            handleSubmit(e.target.value);
          }}
        />
        <button className="search-bar__search-box__button">
          <MdSearch
            className="search-bar__search-box__button-icon"
            onClick={e => {
              e.preventDefault();
              const $input = inputRef.current;
              if ($input) {
                handleSubmit($input.value);
              }
            }}
          />
        </button>
      </div>
      <div className="search-bar__right-spacer" />
    </div>
  );
}
