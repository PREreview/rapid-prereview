/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/background.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/background.js":
/*!***************************!*\
  !*** ./src/background.js ***!
  \***************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.js");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === _constants__WEBPACK_IMPORTED_MODULE_0__["CHECK_SESSION_COOKIE"]) {
    chrome.cookies.get({
      url: "http://127.0.0.1",
      name: 'rapid.sid'
    }, function (cookie) {
      sendResponse({
        type: _constants__WEBPACK_IMPORTED_MODULE_0__["SESSION_COOKIE"],
        payload: cookie
      });
    });
    return true;
  }
}); // Keep icon badge text (counter)  up-to-date

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'stats') {
    port.onMessage.addListener(function (msg, port) {
      switch (msg.type) {
        case 'STATS':
          chrome.browserAction.setBadgeText({
            text: (msg.payload.nReviews + msg.payload.nRequests).toString(),
            tabId: port.sender.tab.id
          });
          break;

        case 'HAS_GSCHOLAR':
          // TODO also toggle icon (`setIcon` see https://developer.chrome.com/extensions/browserAction)
          chrome.browserAction.setBadgeBackgroundColor({
            color: msg.payload.hasGscholar ? 'green' : 'grey',
            tabId: port.sender.tab.id
          });
          break;

        default:
          break;
      }
    });
  }
});

/***/ }),

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/*! exports provided: QUESTIONS, INDEXED_PREPRINT_PROPS, DISEASES, CHECK_SESSION_COOKIE, CHECK_PREPRINT, SESSION_COOKIE, PREPRINT, TOGGLE_SHELL_TAB */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "QUESTIONS", function() { return QUESTIONS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "INDEXED_PREPRINT_PROPS", function() { return INDEXED_PREPRINT_PROPS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DISEASES", function() { return DISEASES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CHECK_SESSION_COOKIE", function() { return CHECK_SESSION_COOKIE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CHECK_PREPRINT", function() { return CHECK_PREPRINT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SESSION_COOKIE", function() { return SESSION_COOKIE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PREPRINT", function() { return PREPRINT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TOGGLE_SHELL_TAB", function() { return TOGGLE_SHELL_TAB; });
// See https://github.com/PREreview/rapid-prereview/issues/6
var QUESTIONS = [{
  identifier: 'ynCoherent',
  question: 'Do the findings support the conclusion?',
  type: 'YesNoQuestion'
}, //
{
  identifier: 'ynRecommend',
  question: 'Would you recommend this?',
  type: 'YesNoQuestion'
}, //
{
  identifier: 'ynRelevantPolicy',
  groupPrefix: 'ynRelevant',
  question: 'Is this relevant to policy?',
  type: 'YesNoQuestion'
}, {
  identifier: 'ynRelevantClinic',
  groupPrefix: 'ynRelevant',
  question: 'Is this relevant to clinic?',
  type: 'YesNoQuestion'
}, //
{
  identifier: 'ynNovel',
  question: 'Are the finding novel?',
  type: 'YesNoQuestion'
}, //
{
  identifier: 'ynBasisFuture',
  question: 'Is there a basis for future work?',
  type: 'YesNoQuestion'
}, //
{
  identifier: 'ynAttentionStats',
  groupPrefix: 'ynAttention',
  question: 'Is special attention needed for statistics?',
  type: 'YesNoQuestion'
}, {
  identifier: 'ynAttentionMethods',
  groupPrefix: 'ynAttention',
  question: 'Is special attention needed for methods?',
  type: 'YesNoQuestion'
}, {
  identifier: 'ynAttentionModel',
  groupPrefix: 'ynAttention',
  question: 'Is special attention needed for model?',
  type: 'YesNoQuestion'
}, {
  identifier: 'ynAttentionEthics',
  groupPrefix: 'ynAttention',
  question: 'Is special attention needed for ethics?',
  type: 'YesNoQuestion'
}, {
  identifier: 'ynAttentionData',
  groupPrefix: 'ynAttention',
  question: 'Is special attention needed for data quality?',
  type: 'YesNoQuestion'
}, //
{
  identifier: 'ynAvailableData',
  groupPrefix: 'ynAvailable',
  question: 'Are data available?',
  type: 'YesNoQuestion'
}, {
  identifier: 'ynAvailableCode',
  groupPrefix: 'ynAvailable',
  question: 'Is code available?',
  type: 'YesNoQuestion'
}, //
{
  identifier: 'ynLimitations',
  question: 'Does the paper discuss limitations?',
  type: 'YesNoQuestion'
}, //
{
  identifier: 'cMethods',
  question: 'Technical comments on methods, data and limitations',
  type: 'Question'
}, {
  identifier: 'cRelevance',
  question: 'Technical comments on novelty, importance, relevance',
  type: 'Question'
}];
var INDEXED_PREPRINT_PROPS = ['@id', '@type', 'doi', 'arXivId', 'url', 'name', 'preprintServer', 'datePosted', 'encoding']; // See https://github.com/PREreview/rapid-prereview/issues/10

var DISEASES = [{
  name: 'Chikungunya',
  priority: 'orange'
}, {
  name: 'Cholera',
  priority: 'yellow'
}, {
  name: 'Crimean-Congo hemorrhagic fever',
  alternateName: 'CCHF',
  priority: 'red'
}, {
  name: 'Dengue',
  priority: 'yellow'
}, {
  name: 'Ebola',
  priority: 'red'
}, {
  name: 'Hendra',
  priority: 'red'
}, {
  name: 'Human immunodeficiency virus',
  alternateName: 'HIV',
  priority: 'yellow'
}, {
  name: 'Influenza',
  priority: 'yellow'
}, {
  name: 'Lassa',
  priority: 'red'
}, {
  name: 'Leishmaniasis',
  priority: 'yellow'
}, {
  name: 'Malaria',
  priority: 'yellow'
}, {
  name: 'Marburg',
  priority: 'red'
}, {
  name: 'Measles',
  priority: 'yellow'
}, {
  name: 'Middle East respiratory syndrome',
  alternateName: 'MERS',
  priority: 'red'
}, {
  name: 'Nipah',
  priority: 'red'
}, {
  name: 'Plague',
  priority: 'yellow'
}, {
  name: 'Rift Valley fever',
  alternateName: 'RVF',
  priority: 'red'
}, {
  name: 'Severe Acute Respiratory Syndrome',
  alternateName: 'SARS',
  priority: 'red'
}, {
  name: 'Severe Fever with Thrombocytopenia Syndrome',
  alternateName: 'SFTS',
  priority: 'orange'
}, {
  name: 'Smallpox',
  priority: 'yellow'
}, {
  name: 'Tuberculosis',
  priority: 'yellow'
}, {
  name: 'West Nile Virus',
  priority: 'yellow'
}, {
  name: 'Yellow fever',
  priority: 'yellow'
}, {
  name: 'Zika',
  priority: 'red'
}]; // messaging for the web extension

var CHECK_SESSION_COOKIE = 'CHECK_SESSION_COOKIE';
var CHECK_PREPRINT = 'CHECK_PREPRINT';
var SESSION_COOKIE = 'SESSION_COOKIE';
var PREPRINT = 'PREPRINT';
var TOGGLE_SHELL_TAB = 'TOGGLE_SHELL_TAB';

/***/ })

/******/ });
//# sourceMappingURL=background.js.map