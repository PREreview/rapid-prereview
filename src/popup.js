import React from 'react';
import ReactDOM from 'react-dom';
import Popup from './components/popup';
import { CHECK_PREPRINT } from './constants';
import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<Popup />, document.getElementById('app'));
});

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { type: CHECK_PREPRINT }, function(
    response
  ) {
    console.log(response);
  });
});
