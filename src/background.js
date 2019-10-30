import { CHECK_SESSION_COOKIE, SESSION_COOKIE } from './constants';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === CHECK_SESSION_COOKIE) {
    chrome.cookies.get(
      {
        url: process.env.COOKIE_URL,
        name: 'rapid.sid'
      },
      cookie => {
        sendResponse({
          type: SESSION_COOKIE,
          payload: cookie
        });
      }
    );

    return true;
  }
});
