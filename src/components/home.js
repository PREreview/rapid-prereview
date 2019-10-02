import React, { useState } from 'react';
import HeaderBar from './header-bar';
import SearchBar from './search-bar';
import LeftSidePanel from './left-side-panel';

export default function Home() {
  const [showLeftPanel, setShowLeftPanel] = useState(true);

  return (
    <div className="home">
      <HeaderBar
        onClickMenuButton={() => {
          console.log('toggle');
          setShowLeftPanel(!showLeftPanel);
        }}
      />
      <SearchBar />
      <div className="home__main">
        <LeftSidePanel visible={showLeftPanel} />
        <div className="home__content">
          <h1>Hello home</h1>
        </div>
        <div className="home__main__right"></div>
      </div>
    </div>
  );
}
