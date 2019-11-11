import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import HeaderBar from './header-bar';
import LeftSidePanel from './left-side-panel';
import { useIsMobile } from '../hooks/ui-hooks';
import { CSS_HEADER_HEIGHT } from '../constants';

/**
 * Use that for all the documentation like pages (Code of Conduct etc.)
 */
export default function TocPage({ children }) {
  const ref = useRef();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile);
  const [toc, setToc] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const doc = ref.current;
    if (doc) {
      const $h2s = doc.querySelectorAll('h2[id]');
      setToc(Array.from($h2s));
    }
  }, [location.pathname]);

  // scroll to hash
  useEffect(() => {
    const hash = location.hash;

    const [, id] = hash.split('#');
    const $el = document.getElementById(id);
    if ($el) {
      window.scroll({
        top: Math.max(
          $el.getBoundingClientRect().top +
            window.scrollY -
            CSS_HEADER_HEIGHT -
            10,
          0
        ),
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [location.hash]);

  // close side panel
  const handleClick = useCallback(
    e => {
      if (isMobile) {
        setShowLeftPanel(false);
      }
    },
    [isMobile]
  );

  return (
    <div className="toc-page">
      <HeaderBar
        onClickMenuButton={() => {
          setShowLeftPanel(!showLeftPanel);
        }}
      />

      <div className="toc-page__main">
        <LeftSidePanel
          visible={showLeftPanel}
          onClickOutside={() => {
            setShowLeftPanel(false);
          }}
        >
          <nav>
            <ul>
              {toc.map($h2 => (
                <li key={$h2.id}>
                  <Link
                    to={{
                      pathname: location.pathname,
                      search: location.search,
                      hash: `#${$h2.id}`
                    }}
                    onClick={handleClick}
                    dangerouslySetInnerHTML={{ __html: $h2.innerHTML }}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </LeftSidePanel>

        <div className="toc-page__body" ref={ref}>
          {children}
        </div>

        <div className="toc-page__right"></div>
      </div>
    </div>
  );
}

TocPage.propTypes = {
  children: PropTypes.any.isRequired
};
