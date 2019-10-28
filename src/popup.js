import React from 'react';
import ReactDOM from 'react-dom';
import Popup from './components/popup';
import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<Popup />, document.getElementById('app'));
});
