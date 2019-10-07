import React from 'react';

export default function ExtensionFallback() {
  const pdfUrl =
    'https://www.biorxiv.org/content/biorxiv/early/2019/09/24/780577.full.pdf';

  return (
    <div>
      <h1>Hello extension fallback</h1>

      <object data={pdfUrl} type="application/pdf">
        {/* Fallback content */}
        <a href={pdfUrl}>Download PDF</a>
      </object>
    </div>
  );
}
