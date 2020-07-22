import React from 'react';
import Editor from '@pubpub/editor';

export default function Pubpub (props) {
  return (
    <Editor
      /* customNodes: Object of custom nodes. To remove default node,
      override. For example, { image: null, header: null } */
      customNodes={{}}

      /* customMarks: Object of custom marks. To remove default mark,
      override. For example, { strong: null } */
      customMarks={{}}

      /* An object of custom plugins, with key=pluginName and
      value=function. All customPlugins values should be a function,
      which is passed schema and props - and returns a Plugin or
      array of Plugins */
      customPlugins={{}}

      /* An object with nodeName keys and values of objects of
      overriding options. For example:
      nodeOptions = { image: { linkToSrc: false } } */
      nodeOptions={{}}

      /* An object with needed collaborative properties */
      collaborativeOptions={{}}

      /* A function that will be called on every editor
      change (cursor and content). Passes up an editorChangeObject
      which is useful for building the interfaces around the editor.
      Also fired on editor initialization. */
      onChange={(changeObject)=>{}}

      /* A function that will be called when the editor
      fails due to an invalid step, firebase error, or
      other transaction error. */
      onError={(err)=>{}}

      /* A editor JSON document. */
      initialContent={{}}

      /* A string to show when the editor is empty. */
      placeholder=""

      /* A boolean that will prevent edits to the document when true. */
      isReadOnly={false}

      /* An array of highlights to be shown with the highlights plugin */
      highlights={[]}

      /* A function for finding highlight content when pasted. Used by
      the highlightQuote plugin */
      getHighlightContent={(from, to)=>{}}

      /* A function that will be called for every click within the
      editor */
      handleSingleClick={(view, pos, node, nodePos, event, direct)=>{}}

      /* A function that will be called for every double click within
      the editor */
      handleDoubleClick={(view, pos, node, nodePos, event, direct)=>{}}
    />
  );
}
