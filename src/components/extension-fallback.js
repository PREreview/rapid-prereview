import React, { Suspense, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import mobile from 'is-mobile';
import { usePreprint } from '../hooks/api-hooks';
import { useExtension } from '../hooks/extension-hooks';
import { getPdfUrl, getCanonicalUrl } from '../utils/preprints';
import Shell from './shell';
import ShellContent from './shell-content';
import NotFound from './not-found';
import SuspenseLoading from './suspense-loading';
import { ORG } from '../constants';
import { createPreprintId } from '../utils/ids';
import { unprefix } from '../utils/jsonld';

const PdfViewer = React.lazy(() =>
  import(/* webpackChunkName: "pdf-viewer" */ './pdf-viewer')
);

// TODO? if no PDF is available display shell in full screen ?

export default function ExtensionFallback() {
  const location = useLocation(); // location.state can be {preprint, tab} with tab being `request` or `review` (so that we know on which tab the shell should be activated with
  const { identifierPart1, identifierPart2, identifierPart3 } = useParams();
  const identifier = [identifierPart1, identifierPart2, identifierPart3]
    .filter(Boolean)
    .join('/');

  const isMobile = useMemo(() => mobile({ tablet: true }), []);

  // See https://github.com/PREreview/rapid-prereview/issues/13
  // Drag and drop over a PDF object is currently broken in Chrome for Mac
  // Bug is tracked here: https://bugs.chromium.org/p/chromium/issues/detail?id=984891&q=drag%20object&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified
  const isChromeOnMac = !!window.chrome && navigator.platform.includes('Mac');

  const [preprint, fetchPreprintProgress] = usePreprint(
    identifier,
    location.state && location.state.preprint,
    location.state && location.state.preprint && location.state.preprint.url
  );
  useExtension(preprint && createPreprintId(preprint));

  if (
    fetchPreprintProgress.error &&
    fetchPreprintProgress.error.statusCode >= 400
  ) {
    return <NotFound />;
  }

  let preprintId = preprint && createPreprintId(preprint);
  preprintId = preprintId && unprefix(preprintId);
  const pdfUrl = getPdfUrl(preprint);
  const canonicalUrl = getCanonicalUrl(preprint);

  return (
    <div className="extension-fallback">
      <Helmet>
        <title>
          {ORG} • {identifier}
        </title>
      </Helmet>

      {pdfUrl ? (
        isMobile || isChromeOnMac ? (
          /* for mobile devices we always use the fallback */
          <Suspense fallback={<SuspenseLoading>Loading PDF</SuspenseLoading>}>
            <PdfViewer
              docId={preprintId}
              pdfUrl={pdfUrl}
              loading={<SuspenseLoading>Loading PDF</SuspenseLoading>}
            />
          </Suspense>
        ) : (
          <object
            key={pdfUrl}
            data={pdfUrl}
            // type="application/pdf" commented out as it seems to break pdf loading in safari
            // typemustmatch="true" commented out as it doesn't seem to be currently supported by react
          >
            {/* fallback text in case we can't load the PDF */}
            <Suspense fallback={<SuspenseLoading>Loading PDF</SuspenseLoading>}>
              <PdfViewer
                docId={identifier}
                pdfUrl={pdfUrl}
                loading={<SuspenseLoading>Loading PDF</SuspenseLoading>}
              />
            </Suspense>
          </object>
        )
      ) : preprint && !pdfUrl && !fetchPreprintProgress.isActive ? (
        <div className="extension-fallback__no-pdf-message">
          <div>
            No PDF available.
            {!!canonicalUrl && (
              <span>
                {` `}You can visit{' '}
                {
                  <a
                    href={canonicalUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {canonicalUrl}
                  </a>
                }{' '}
                for more information on the document.
              </span>
            )}
          </div>
        </div>
      ) : null}

      <Shell>
        {onRequireScreen =>
          !!preprint && (
            <ShellContent
              onRequireScreen={onRequireScreen}
              preprint={preprint}
              defaultTab={location.state && location.state.tab}
            />
          )
        }
      </Shell>
    </div>
  );
}
