import React from 'react';
import HeaderBar from './header-bar';
import SearchBar from './search-bar';

export default function Home() {
  return (
    <div className="home">
      <HeaderBar />
      <SearchBar />
      <h1>Hello home</h1>
    </div>
  );
}
