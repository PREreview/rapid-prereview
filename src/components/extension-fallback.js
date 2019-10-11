import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { usePreprint } from '../hooks/api-hooks';
import { getPdfUrl, getCanonicalUrl } from '../utils/preprints';
import Shell from './shell';
import ShellContent from './shell-content';

export default function ExtensionFallback() {
  const location = useLocation(); // location.state can be {preprint, tab} with tab being `request` or `review` (so that we know on which tab the shell should be activated with
  const { identifierPart1, identifierPart2 } = useParams();
  const identifier = [identifierPart1, identifierPart2]
    .filter(Boolean)
    .join('/');

  const [preprint, fetchPreprintProgress] = usePreprint(
    identifier,
    location.state && location.state.preprint
  );

  const pdfUrl = getPdfUrl(preprint);
  const canonicalUrl = getCanonicalUrl(preprint);

  return (
    <div>
      {pdfUrl && (
        <object
          key={pdfUrl}
          data={pdfUrl}
          type="application/pdf"
          typemustmatch="true" // Note typeMustMatch doesn't seem to be currently supported by react
        >
          {/* fallback text in case we can't load the PDF */}
          Could not retrieve the PDF.
          {!!canonicalUrl && (
            <span>
              You can visit {<a href={canonicalUrl}>{canonicalUrl}</a>} instead.
            </span>
          )}
        </object>
      )}

      <Shell>
        {!!preprint && (
          <ShellContent
            preprint={preprint}
            defaultTab={location.state && location.state.tab}
          />
        )}
      </Shell>
    </div>
  );
}
