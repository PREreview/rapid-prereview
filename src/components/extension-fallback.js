import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { usePreprint } from '../hooks/api-hooks';

export default function ExtensionFallback() {
  const pdfUrl =
    'https://www.biorxiv.org/content/biorxiv/early/2019/09/24/780577.full.pdf';

  const location = useLocation(); // location.state can be {identifier, preprint, tab, answerMap} with tab being `request` or `review` (so that we know on which tab the shell should be activated with
  const { identifierPart1, identifierPart2 } = useParams();
  const identifier = [identifierPart1, identifierPart2]
    .filter(Boolean)
    .join('/');

  const [preprint, fetchPreprintProgress] = usePreprint(
    identifier,
    location.state && location.state.preprint
  );

  return (
    <div>
      <h1>Hello extension fallback</h1>

      {/*
      <object data={pdfUrl} type="application/pdf">
        <a href={pdfUrl}>Download PDF</a>
      </object>*/}
    </div>
  );
}
