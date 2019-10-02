import React from 'react';
import { MdSearch } from 'react-icons/md';

export default function SearchBar() {
  return (
    <div className="search-bar">
      <div className="search-bar__search-box">
        <input type="text" className="search-bar__search-box__input" />
        <button className="search-bar__search-box__button">
          <MdSearch className="search-bar__search-box__button-icon" />
        </button>
      </div>
    </div>
  );
}
