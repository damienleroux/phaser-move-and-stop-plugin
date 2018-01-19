(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _moveAndStopCore = require("./move-and-stop-core");

var postUpdate = _moveAndStopCore.postUpdate;
var isItemMoving = _moveAndStopCore.isItemMoving;
var moveToXY = _moveAndStopCore.moveToXY;
var moveToObject = _moveAndStopCore.moveToObject;
var stopToMove = _moveAndStopCore.stopToMove;

//Plugin Core definition

function MoveAndStop(game, parent) {
	Phaser.Plugin.call(this, game, parent);
	this.objectsToMove = [];
	this.active = true; //enable reUpdate and update methods called by the parent
}

MoveAndStop.prototype = Object.create(Phaser.Plugin.prototype);

MoveAndStop.prototype.postUpdate = function postUpdate_() {
	return postUpdate(this.objectsToMove, this.game);
};

//Plugin moving functions

MoveAndStop.prototype.toXY = function toXY(displayObject, x, y, speed, maxTime, events) {
	return moveToXY(this.objectsToMove, this.game, displayObject, x, y, speed, maxTime, events);
};

MoveAndStop.prototype.toObject = function toObject(displayObject, destination, speed, maxTime, events) {
	return moveToObject(this.objectsToMove, this.game, displayObject, destination, speed, maxTime, events);
};

MoveAndStop.prototype.stop = function stop(displayObject) {
	return stopToMove(this.objectsToMove, displayObject);
};

// Utils

MoveAndStop.prototype.isItemMoving = function (displayObject) {
	return isItemMoving(displayObject);
};

module.exports = MoveAndStop;

},{"./move-and-stop-core":6}],2:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9kZWJ1Zy9zcmMvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJyMwMDAwQ0MnLCAnIzAwMDBGRicsICcjMDAzM0NDJywgJyMwMDMzRkYnLCAnIzAwNjZDQycsICcjMDA2NkZGJywgJyMwMDk5Q0MnLFxuICAnIzAwOTlGRicsICcjMDBDQzAwJywgJyMwMENDMzMnLCAnIzAwQ0M2NicsICcjMDBDQzk5JywgJyMwMENDQ0MnLCAnIzAwQ0NGRicsXG4gICcjMzMwMENDJywgJyMzMzAwRkYnLCAnIzMzMzNDQycsICcjMzMzM0ZGJywgJyMzMzY2Q0MnLCAnIzMzNjZGRicsICcjMzM5OUNDJyxcbiAgJyMzMzk5RkYnLCAnIzMzQ0MwMCcsICcjMzNDQzMzJywgJyMzM0NDNjYnLCAnIzMzQ0M5OScsICcjMzNDQ0NDJywgJyMzM0NDRkYnLFxuICAnIzY2MDBDQycsICcjNjYwMEZGJywgJyM2NjMzQ0MnLCAnIzY2MzNGRicsICcjNjZDQzAwJywgJyM2NkNDMzMnLCAnIzk5MDBDQycsXG4gICcjOTkwMEZGJywgJyM5OTMzQ0MnLCAnIzk5MzNGRicsICcjOTlDQzAwJywgJyM5OUNDMzMnLCAnI0NDMDAwMCcsICcjQ0MwMDMzJyxcbiAgJyNDQzAwNjYnLCAnI0NDMDA5OScsICcjQ0MwMENDJywgJyNDQzAwRkYnLCAnI0NDMzMwMCcsICcjQ0MzMzMzJywgJyNDQzMzNjYnLFxuICAnI0NDMzM5OScsICcjQ0MzM0NDJywgJyNDQzMzRkYnLCAnI0NDNjYwMCcsICcjQ0M2NjMzJywgJyNDQzk5MDAnLCAnI0NDOTkzMycsXG4gICcjQ0NDQzAwJywgJyNDQ0NDMzMnLCAnI0ZGMDAwMCcsICcjRkYwMDMzJywgJyNGRjAwNjYnLCAnI0ZGMDA5OScsICcjRkYwMENDJyxcbiAgJyNGRjAwRkYnLCAnI0ZGMzMwMCcsICcjRkYzMzMzJywgJyNGRjMzNjYnLCAnI0ZGMzM5OScsICcjRkYzM0NDJywgJyNGRjMzRkYnLFxuICAnI0ZGNjYwMCcsICcjRkY2NjMzJywgJyNGRjk5MDAnLCAnI0ZGOTkzMycsICcjRkZDQzAwJywgJyNGRkNDMzMnXG5dO1xuXG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG5cbmZ1bmN0aW9uIHVzZUNvbG9ycygpIHtcbiAgLy8gTkI6IEluIGFuIEVsZWN0cm9uIHByZWxvYWQgc2NyaXB0LCBkb2N1bWVudCB3aWxsIGJlIGRlZmluZWQgYnV0IG5vdCBmdWxseVxuICAvLyBpbml0aWFsaXplZC4gU2luY2Ugd2Uga25vdyB3ZSdyZSBpbiBDaHJvbWUsIHdlJ2xsIGp1c3QgZGV0ZWN0IHRoaXMgY2FzZVxuICAvLyBleHBsaWNpdGx5XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucHJvY2VzcyAmJiB3aW5kb3cucHJvY2Vzcy50eXBlID09PSAncmVuZGVyZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBJbnRlcm5ldCBFeHBsb3JlciBhbmQgRWRnZSBkbyBub3Qgc3VwcG9ydCBjb2xvcnMuXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvKGVkZ2V8dHJpZGVudClcXC8oXFxkKykvKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIC8vIGRvY3VtZW50IGlzIHVuZGVmaW5lZCBpbiByZWFjdC1uYXRpdmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC1uYXRpdmUvcHVsbC8xNjMyXG4gIHJldHVybiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5XZWJraXRBcHBlYXJhbmNlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgKHdpbmRvdy5jb25zb2xlLmZpcmVidWcgfHwgKHdpbmRvdy5jb25zb2xlLmV4Y2VwdGlvbiAmJiB3aW5kb3cuY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLykpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnIubWVzc2FnZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoYXJncykge1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm47XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKVxuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXpBLVolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICghciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHIgPSBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxuXG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iXX0=
},{"./debug":3,"_process":5}],3:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":4}],4:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.postUpdate = postUpdate;
exports.isItemMoving = isItemMoving;
exports.moveToXY = moveToXY;
exports.moveToObject = moveToObject;
exports.stopToMove = stopToMove;
Object.defineProperty(exports, "__esModule", {
	value: true
});

var debugLogger = _interopRequire(require("debug"));

var debug = debugLogger("phaser-move-and-stop-plugin:moveAndStop");
var debugObjectToMove = function (objectsToMove, objectToMove, label) {
	return debug("" + objectsToMove.indexOf(objectToMove) + ": " + label);
};

var STATE = {
	isMoving: "isMoving",
	hasStopped: "hasStopped"
};

function findObjectToMove(objectsToMove, displayObject) {
	if (displayObject) {
		return objectsToMove.find(function (objectToMove) {
			return objectToMove.displayObject === displayObject;
		});
	}
	return undefined;
}

function addDisplayObjectToList(objectsToMove, displayObject) {
	var info = arguments[2] === undefined ? {} : arguments[2];

	var objectToMove = {
		displayObject: displayObject,
		info: info
	};
	objectsToMove.push(objectToMove);
	debugObjectToMove(objectsToMove, objectToMove, "addDisplayObjectToList x:" + info.x + " y:" + info.y + " speed:" + info.speed + " maxTime:" + info.maxTime + " events:" + (info.events ? Object.keys(info.events) : info.events));
}

function removeObjectToMove(objectsToMove, objectToMove) {
	debugObjectToMove(objectsToMove, objectToMove, "removeObjectToMove");
	if (objectToMove) {
		var index = objectsToMove.indexOf(objectToMove);
		if (index > -1) {
			objectsToMove.splice(index, 1);
		}
	}
}

function stopObjectMovement(objectToMove) {
	var displayObject = objectToMove.displayObject;
	var info = objectToMove.info;

	displayObject.body.velocity.x = 0;
	displayObject.body.velocity.y = 0;

	if (info.events) {
		if (info.events.onPositionReached) {
			info.events.onPositionReached(displayObject);
		}
		if (info.events.onStopped) {
			info.events.onStopped(displayObject);
		}
	}

	info.move = STATE.hasStopped;
}

function updateObjectMovement(game, objectToMove) {
	var displayObject = objectToMove.displayObject;
	var info = objectToMove.info;

	if (displayObject.alive && info.moveDistFromTarget && displayObject.body) {

		if (isMoving(objectToMove)) {
			var updatedDist = game.physics.arcade.distanceToXY(displayObject, info.x, info.y);
			if (updatedDist === 0 || updatedDist > info.moveDistFromTarget) {
				// if displayObject is still moving, we ask to pahser to stop it (stop velocity)
				stopObjectMovement(objectToMove);
				// update coordinates
				displayObject.x = info.x;
				displayObject.y = info.y;
			} else {
				//if not stopped, or no need to stop, we update last distance between current displayObject and targetted corrdinates
				info.moveDistFromTarget = updatedDist;
			}
		}
	}
}

function isMoving(objectToMove) {
	var info = objectToMove.info;

	return info.move === STATE.isMoving;
}

function hasStopped(objectToMove) {
	var info = objectToMove.info;

	return info.move === STATE.hasStopped;
}

function postUpdate(objectsToMove, game) {
	var objectsNotAlive = [];
	objectsToMove.forEach(function (objectToMove) {
		var displayObject = objectToMove.displayObject;
		var info = objectToMove.info;

		if (!displayObject || !displayObject.alive || hasStopped(objectToMove)) {
			if (info && info.events) {
				if (info.events.onStopped) {
					info.events.onStopped(displayObject);
				}
			}
			objectsNotAlive.push(objectToMove);
		} else {
			updateObjectMovement(game, objectToMove);
			if (hasStopped(objectToMove)) {
				objectsNotAlive.push(objectToMove);
			}
		}
	});

	objectsNotAlive.forEach(function (objectToMove) {
		removeObjectToMove(objectsToMove, objectToMove);
	});
}

function isItemMoving(displayObject) {
	if (!displayObject) {
		throw new Error("object is undefined");
	}
	return displayObject.body && displayObject.body.velocity && (displayObject.body.velocity.x || displayObject.body.velocity.y);
}

function moveToXY(objectsToMove, game, displayObject, x, y, speed, maxTime, events) {
	if (displayObject && displayObject.alive && displayObject.body) {
		var objectToMove = findObjectToMove(objectsToMove, displayObject);

		if (!objectToMove || (objectToMove.info.x !== x || objectToMove.info.y !== y || objectToMove.info.speed !== speed || objectToMove.info.maxTime !== maxTime || objectToMove.info.events !== events)) {
			if (objectToMove) {
				removeObjectToMove(objectsToMove, objectToMove);
			}
			var moveDistFromTarget = game.physics.arcade.distanceToXY(displayObject, x, y);
			addDisplayObjectToList(objectsToMove, displayObject, {
				move: STATE.isMoving,
				x: x,
				y: y,
				speed: speed,
				maxTime: maxTime,
				events: events,
				moveDistFromTarget: moveDistFromTarget,
				moveDistFromTargetOrigin: moveDistFromTarget
			});
			return game.physics.arcade.moveToXY(displayObject, x, y, speed, maxTime);
		}
	}
}

function moveToObject(objectsToMove, game, displayObject, destination, speed, maxTime, events) {
	return moveToXY(objectsToMove, game, displayObject, destination.x, destination.y, speed, maxTime, events);
}

function stopToMove(objectsToMove, displayObject) {
	var objectToMove = findObjectToMove(objectsToMove, displayObject);
	if (objectToMove) {
		if (isMoving(objectToMove)) {
			stopObjectMovement(objectToMove);
		}
	}
}

},{"debug":2}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1VzZXJzL2RhbWllbi9Eb2N1bWVudHMvd29ya3NwYWNlL3BoYXNlci1tb3ZlLWFuZC1zdG9wLXBsdWdpbi9zcmMvbW92ZS1hbmQtc3RvcC1wbHVnaW4uanMiLCJub2RlX21vZHVsZXNcXGRlYnVnXFxzcmNcXGJyb3dzZXIuanMiLCJub2RlX21vZHVsZXNcXGRlYnVnXFxzcmNcXGRlYnVnLmpzIiwibm9kZV9tb2R1bGVzXFxtc1xcaW5kZXguanMiLCJub2RlX21vZHVsZXNcXHByb2Nlc3NcXGJyb3dzZXIuanMiLCJDOi9Vc2Vycy9kYW1pZW4vRG9jdW1lbnRzL3dvcmtzcGFjZS9waGFzZXItbW92ZS1hbmQtc3RvcC1wbHVnaW4vc3JjL21vdmUtYW5kLXN0b3AtY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OytCQ01PLHNCQUFzQjs7SUFMNUIsVUFBVSxvQkFBVixVQUFVO0lBQ1YsWUFBWSxvQkFBWixZQUFZO0lBQ1osUUFBUSxvQkFBUixRQUFRO0lBQ1IsWUFBWSxvQkFBWixZQUFZO0lBQ1osVUFBVSxvQkFBVixVQUFVOzs7O0FBS1gsU0FBUyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUNsQyxPQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZDLEtBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLEtBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0NBQ25COztBQUVELFdBQVcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUvRCxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLFdBQVcsR0FBRztBQUN6RCxRQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNqRCxDQUFDOzs7O0FBSUYsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDdkYsUUFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDNUYsQ0FBQzs7QUFFRixXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLFFBQVEsQ0FBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQ3RHLFFBQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDdkcsQ0FBQzs7QUFFRixXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDekQsUUFBTyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztDQUNyRCxDQUFDOzs7O0FBSUYsV0FBVyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBQyxhQUFhLEVBQUs7QUFDdkQsUUFBTyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7Q0FDbkMsQ0FBQzs7aUJBRWEsV0FBVzs7O0FDMUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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RTtBQUMzQixxQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUNqQztFQUNEO0NBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtcclxuXHRwb3N0VXBkYXRlLFxyXG5cdGlzSXRlbU1vdmluZyxcclxuXHRtb3ZlVG9YWSxcclxuXHRtb3ZlVG9PYmplY3QsXHJcblx0c3RvcFRvTW92ZVxyXG59IGZyb20gJy4vbW92ZS1hbmQtc3RvcC1jb3JlJztcclxuXHJcbi8vUGx1Z2luIENvcmUgZGVmaW5pdGlvblxyXG5cclxuZnVuY3Rpb24gTW92ZUFuZFN0b3AoZ2FtZSwgcGFyZW50KSB7XHJcblx0UGhhc2VyLlBsdWdpbi5jYWxsKHRoaXMsIGdhbWUsIHBhcmVudCk7XHJcblx0dGhpcy5vYmplY3RzVG9Nb3ZlID0gW107XHJcblx0dGhpcy5hY3RpdmUgPSB0cnVlOyAvL2VuYWJsZSByZVVwZGF0ZSBhbmQgdXBkYXRlIG1ldGhvZHMgY2FsbGVkIGJ5IHRoZSBwYXJlbnRcclxufVxyXG5cclxuTW92ZUFuZFN0b3AucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQaGFzZXIuUGx1Z2luLnByb3RvdHlwZSk7XHJcblxyXG5Nb3ZlQW5kU3RvcC5wcm90b3R5cGUucG9zdFVwZGF0ZSA9IGZ1bmN0aW9uIHBvc3RVcGRhdGVfKCkge1xyXG5cdHJldHVybiBwb3N0VXBkYXRlKHRoaXMub2JqZWN0c1RvTW92ZSwgdGhpcy5nYW1lKTtcclxufTtcclxuXHJcbi8vUGx1Z2luIG1vdmluZyBmdW5jdGlvbnNcclxuXHJcbk1vdmVBbmRTdG9wLnByb3RvdHlwZS50b1hZID0gZnVuY3Rpb24gdG9YWShkaXNwbGF5T2JqZWN0LCB4LCB5LCBzcGVlZCwgbWF4VGltZSwgZXZlbnRzKSB7XHJcblx0cmV0dXJuIG1vdmVUb1hZKHRoaXMub2JqZWN0c1RvTW92ZSwgdGhpcy5nYW1lLCBkaXNwbGF5T2JqZWN0LCB4LCB5LCBzcGVlZCwgbWF4VGltZSwgZXZlbnRzKTtcclxufTtcclxuXHJcbk1vdmVBbmRTdG9wLnByb3RvdHlwZS50b09iamVjdCA9IGZ1bmN0aW9uIHRvT2JqZWN0KGRpc3BsYXlPYmplY3QsIGRlc3RpbmF0aW9uLCBzcGVlZCwgbWF4VGltZSwgZXZlbnRzKSB7XHJcblx0cmV0dXJuIG1vdmVUb09iamVjdCh0aGlzLm9iamVjdHNUb01vdmUsIHRoaXMuZ2FtZSwgZGlzcGxheU9iamVjdCwgZGVzdGluYXRpb24sIHNwZWVkLCBtYXhUaW1lLCBldmVudHMpO1xyXG59O1xyXG5cclxuTW92ZUFuZFN0b3AucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiBzdG9wKGRpc3BsYXlPYmplY3QpIHtcclxuXHRyZXR1cm4gc3RvcFRvTW92ZSh0aGlzLm9iamVjdHNUb01vdmUsIGRpc3BsYXlPYmplY3QpO1xyXG59O1xyXG5cclxuLy8gVXRpbHNcclxuXHJcbk1vdmVBbmRTdG9wLnByb3RvdHlwZS5pc0l0ZW1Nb3ZpbmcgPSAoZGlzcGxheU9iamVjdCkgPT4ge1xyXG5cdHJldHVybiBpc0l0ZW1Nb3ZpbmcoZGlzcGxheU9iamVjdCk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb3ZlQW5kU3RvcDtcclxuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJyMwMDAwQ0MnLCAnIzAwMDBGRicsICcjMDAzM0NDJywgJyMwMDMzRkYnLCAnIzAwNjZDQycsICcjMDA2NkZGJywgJyMwMDk5Q0MnLFxuICAnIzAwOTlGRicsICcjMDBDQzAwJywgJyMwMENDMzMnLCAnIzAwQ0M2NicsICcjMDBDQzk5JywgJyMwMENDQ0MnLCAnIzAwQ0NGRicsXG4gICcjMzMwMENDJywgJyMzMzAwRkYnLCAnIzMzMzNDQycsICcjMzMzM0ZGJywgJyMzMzY2Q0MnLCAnIzMzNjZGRicsICcjMzM5OUNDJyxcbiAgJyMzMzk5RkYnLCAnIzMzQ0MwMCcsICcjMzNDQzMzJywgJyMzM0NDNjYnLCAnIzMzQ0M5OScsICcjMzNDQ0NDJywgJyMzM0NDRkYnLFxuICAnIzY2MDBDQycsICcjNjYwMEZGJywgJyM2NjMzQ0MnLCAnIzY2MzNGRicsICcjNjZDQzAwJywgJyM2NkNDMzMnLCAnIzk5MDBDQycsXG4gICcjOTkwMEZGJywgJyM5OTMzQ0MnLCAnIzk5MzNGRicsICcjOTlDQzAwJywgJyM5OUNDMzMnLCAnI0NDMDAwMCcsICcjQ0MwMDMzJyxcbiAgJyNDQzAwNjYnLCAnI0NDMDA5OScsICcjQ0MwMENDJywgJyNDQzAwRkYnLCAnI0NDMzMwMCcsICcjQ0MzMzMzJywgJyNDQzMzNjYnLFxuICAnI0NDMzM5OScsICcjQ0MzM0NDJywgJyNDQzMzRkYnLCAnI0NDNjYwMCcsICcjQ0M2NjMzJywgJyNDQzk5MDAnLCAnI0NDOTkzMycsXG4gICcjQ0NDQzAwJywgJyNDQ0NDMzMnLCAnI0ZGMDAwMCcsICcjRkYwMDMzJywgJyNGRjAwNjYnLCAnI0ZGMDA5OScsICcjRkYwMENDJyxcbiAgJyNGRjAwRkYnLCAnI0ZGMzMwMCcsICcjRkYzMzMzJywgJyNGRjMzNjYnLCAnI0ZGMzM5OScsICcjRkYzM0NDJywgJyNGRjMzRkYnLFxuICAnI0ZGNjYwMCcsICcjRkY2NjMzJywgJyNGRjk5MDAnLCAnI0ZGOTkzMycsICcjRkZDQzAwJywgJyNGRkNDMzMnXG5dO1xuXG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG5cbmZ1bmN0aW9uIHVzZUNvbG9ycygpIHtcbiAgLy8gTkI6IEluIGFuIEVsZWN0cm9uIHByZWxvYWQgc2NyaXB0LCBkb2N1bWVudCB3aWxsIGJlIGRlZmluZWQgYnV0IG5vdCBmdWxseVxuICAvLyBpbml0aWFsaXplZC4gU2luY2Ugd2Uga25vdyB3ZSdyZSBpbiBDaHJvbWUsIHdlJ2xsIGp1c3QgZGV0ZWN0IHRoaXMgY2FzZVxuICAvLyBleHBsaWNpdGx5XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucHJvY2VzcyAmJiB3aW5kb3cucHJvY2Vzcy50eXBlID09PSAncmVuZGVyZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBJbnRlcm5ldCBFeHBsb3JlciBhbmQgRWRnZSBkbyBub3Qgc3VwcG9ydCBjb2xvcnMuXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvKGVkZ2V8dHJpZGVudClcXC8oXFxkKykvKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIC8vIGRvY3VtZW50IGlzIHVuZGVmaW5lZCBpbiByZWFjdC1uYXRpdmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC1uYXRpdmUvcHVsbC8xNjMyXG4gIHJldHVybiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5XZWJraXRBcHBlYXJhbmNlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgKHdpbmRvdy5jb25zb2xlLmZpcmVidWcgfHwgKHdpbmRvdy5jb25zb2xlLmV4Y2VwdGlvbiAmJiB3aW5kb3cuY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLykpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnIubWVzc2FnZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoYXJncykge1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm47XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKVxuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXpBLVolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICghciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHIgPSBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxuXG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpKVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OWtaV0oxWnk5emNtTXZZbkp2ZDNObGNpNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWk4cUtseHVJQ29nVkdocGN5QnBjeUIwYUdVZ2QyVmlJR0p5YjNkelpYSWdhVzF3YkdWdFpXNTBZWFJwYjI0Z2IyWWdZR1JsWW5WbktDbGdMbHh1SUNwY2JpQXFJRVY0Y0c5elpTQmdaR1ZpZFdjb0tXQWdZWE1nZEdobElHMXZaSFZzWlM1Y2JpQXFMMXh1WEc1bGVIQnZjblJ6SUQwZ2JXOWtkV3hsTG1WNGNHOXlkSE1nUFNCeVpYRjFhWEpsS0NjdUwyUmxZblZuSnlrN1hHNWxlSEJ2Y25SekxteHZaeUE5SUd4dlp6dGNibVY0Y0c5eWRITXVabTl5YldGMFFYSm5jeUE5SUdadmNtMWhkRUZ5WjNNN1hHNWxlSEJ2Y25SekxuTmhkbVVnUFNCellYWmxPMXh1Wlhod2IzSjBjeTVzYjJGa0lEMGdiRzloWkR0Y2JtVjRjRzl5ZEhNdWRYTmxRMjlzYjNKeklEMGdkWE5sUTI5c2IzSnpPMXh1Wlhod2IzSjBjeTV6ZEc5eVlXZGxJRDBnSjNWdVpHVm1hVzVsWkNjZ0lUMGdkSGx3Wlc5bUlHTm9jbTl0WlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSmlZZ0ozVnVaR1ZtYVc1bFpDY2dJVDBnZEhsd1pXOW1JR05vY205dFpTNXpkRzl5WVdkbFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQS9JR05vY205dFpTNXpkRzl5WVdkbExteHZZMkZzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBNklHeHZZMkZzYzNSdmNtRm5aU2dwTzF4dVhHNHZLaXBjYmlBcUlFTnZiRzl5Y3k1Y2JpQXFMMXh1WEc1bGVIQnZjblJ6TG1OdmJHOXljeUE5SUZ0Y2JpQWdKeU13TURBd1EwTW5MQ0FuSXpBd01EQkdSaWNzSUNjak1EQXpNME5ESnl3Z0p5TXdNRE16UmtZbkxDQW5JekF3TmpaRFF5Y3NJQ2NqTURBMk5rWkdKeXdnSnlNd01EazVRME1uTEZ4dUlDQW5JekF3T1RsR1JpY3NJQ2NqTURCRFF6QXdKeXdnSnlNd01FTkRNek1uTENBbkl6QXdRME0yTmljc0lDY2pNREJEUXprNUp5d2dKeU13TUVORFEwTW5MQ0FuSXpBd1EwTkdSaWNzWEc0Z0lDY2pNek13TUVOREp5d2dKeU16TXpBd1JrWW5MQ0FuSXpNek16TkRReWNzSUNjak16TXpNMFpHSnl3Z0p5TXpNelkyUTBNbkxDQW5Jek16TmpaR1JpY3NJQ2NqTXpNNU9VTkRKeXhjYmlBZ0p5TXpNems1UmtZbkxDQW5Jek16UTBNd01DY3NJQ2NqTXpORFF6TXpKeXdnSnlNek0wTkROalluTENBbkl6TXpRME01T1Njc0lDY2pNek5EUTBOREp5d2dKeU16TTBORFJrWW5MRnh1SUNBbkl6WTJNREJEUXljc0lDY2pOall3TUVaR0p5d2dKeU0yTmpNelEwTW5MQ0FuSXpZMk16TkdSaWNzSUNjak5qWkRRekF3Snl3Z0p5TTJOa05ETXpNbkxDQW5Jems1TURCRFF5Y3NYRzRnSUNjak9Ua3dNRVpHSnl3Z0p5TTVPVE16UTBNbkxDQW5Jems1TXpOR1JpY3NJQ2NqT1RsRFF6QXdKeXdnSnlNNU9VTkRNek1uTENBbkkwTkRNREF3TUNjc0lDY2pRME13TURNekp5eGNiaUFnSnlORFF6QXdOalluTENBbkkwTkRNREE1T1Njc0lDY2pRME13TUVOREp5d2dKeU5EUXpBd1JrWW5MQ0FuSTBORE16TXdNQ2NzSUNjalEwTXpNek16Snl3Z0p5TkRRek16TmpZbkxGeHVJQ0FuSTBORE16TTVPU2NzSUNjalEwTXpNME5ESnl3Z0p5TkRRek16UmtZbkxDQW5JME5ETmpZd01DY3NJQ2NqUTBNMk5qTXpKeXdnSnlORFF6azVNREFuTENBbkkwTkRPVGt6TXljc1hHNGdJQ2NqUTBORFF6QXdKeXdnSnlORFEwTkRNek1uTENBbkkwWkdNREF3TUNjc0lDY2pSa1l3TURNekp5d2dKeU5HUmpBd05qWW5MQ0FuSTBaR01EQTVPU2NzSUNjalJrWXdNRU5ESnl4Y2JpQWdKeU5HUmpBd1JrWW5MQ0FuSTBaR016TXdNQ2NzSUNjalJrWXpNek16Snl3Z0p5TkdSak16TmpZbkxDQW5JMFpHTXpNNU9TY3NJQ2NqUmtZek0wTkRKeXdnSnlOR1JqTXpSa1luTEZ4dUlDQW5JMFpHTmpZd01DY3NJQ2NqUmtZMk5qTXpKeXdnSnlOR1JqazVNREFuTENBbkkwWkdPVGt6TXljc0lDY2pSa1pEUXpBd0p5d2dKeU5HUmtORE16TW5YRzVkTzF4dVhHNHZLaXBjYmlBcUlFTjFjbkpsYm5Sc2VTQnZibXg1SUZkbFlrdHBkQzFpWVhObFpDQlhaV0lnU1c1emNHVmpkRzl5Y3l3Z1JtbHlaV1p2ZUNBK1BTQjJNekVzWEc0Z0tpQmhibVFnZEdobElFWnBjbVZpZFdjZ1pYaDBaVzV6YVc5dUlDaGhibmtnUm1seVpXWnZlQ0IyWlhKemFXOXVLU0JoY21VZ2EyNXZkMjVjYmlBcUlIUnZJSE4xY0hCdmNuUWdYQ0lsWTF3aUlFTlRVeUJqZFhOMGIyMXBlbUYwYVc5dWN5NWNiaUFxWEc0Z0tpQlVUMFJQT2lCaFpHUWdZU0JnYkc5allXeFRkRzl5WVdkbFlDQjJZWEpwWVdKc1pTQjBieUJsZUhCc2FXTnBkR3g1SUdWdVlXSnNaUzlrYVhOaFlteGxJR052Ykc5eWMxeHVJQ292WEc1Y2JtWjFibU4wYVc5dUlIVnpaVU52Ykc5eWN5Z3BJSHRjYmlBZ0x5OGdUa0k2SUVsdUlHRnVJRVZzWldOMGNtOXVJSEJ5Wld4dllXUWdjMk55YVhCMExDQmtiMk4xYldWdWRDQjNhV3hzSUdKbElHUmxabWx1WldRZ1luVjBJRzV2ZENCbWRXeHNlVnh1SUNBdkx5QnBibWwwYVdGc2FYcGxaQzRnVTJsdVkyVWdkMlVnYTI1dmR5QjNaU2R5WlNCcGJpQkRhSEp2YldVc0lIZGxKMnhzSUdwMWMzUWdaR1YwWldOMElIUm9hWE1nWTJGelpWeHVJQ0F2THlCbGVIQnNhV05wZEd4NVhHNGdJR2xtSUNoMGVYQmxiMllnZDJsdVpHOTNJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5QW1KaUIzYVc1a2IzY3VjSEp2WTJWemN5QW1KaUIzYVc1a2IzY3VjSEp2WTJWemN5NTBlWEJsSUQwOVBTQW5jbVZ1WkdWeVpYSW5LU0I3WEc0Z0lDQWdjbVYwZFhKdUlIUnlkV1U3WEc0Z0lIMWNibHh1SUNBdkx5QkpiblJsY201bGRDQkZlSEJzYjNKbGNpQmhibVFnUldSblpTQmtieUJ1YjNRZ2MzVndjRzl5ZENCamIyeHZjbk11WEc0Z0lHbG1JQ2gwZVhCbGIyWWdibUYyYVdkaGRHOXlJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5QW1KaUJ1WVhacFoyRjBiM0l1ZFhObGNrRm5aVzUwSUNZbUlHNWhkbWxuWVhSdmNpNTFjMlZ5UVdkbGJuUXVkRzlNYjNkbGNrTmhjMlVvS1M1dFlYUmphQ2d2S0dWa1oyVjhkSEpwWkdWdWRDbGNYQzhvWEZ4a0t5a3ZLU2tnZTF4dUlDQWdJSEpsZEhWeWJpQm1ZV3h6WlR0Y2JpQWdmVnh1WEc0Z0lDOHZJR2x6SUhkbFltdHBkRDhnYUhSMGNEb3ZMM04wWVdOcmIzWmxjbVpzYjNjdVkyOXRMMkV2TVRZME5UazJNRFl2TXpjMk56Y3pYRzRnSUM4dklHUnZZM1Z0Wlc1MElHbHpJSFZ1WkdWbWFXNWxaQ0JwYmlCeVpXRmpkQzF1WVhScGRtVTZJR2gwZEhCek9pOHZaMmwwYUhWaUxtTnZiUzltWVdObFltOXZheTl5WldGamRDMXVZWFJwZG1VdmNIVnNiQzh4TmpNeVhHNGdJSEpsZEhWeWJpQW9kSGx3Wlc5bUlHUnZZM1Z0Wlc1MElDRTlQU0FuZFc1a1pXWnBibVZrSnlBbUppQmtiMk4xYldWdWRDNWtiMk4xYldWdWRFVnNaVzFsYm5RZ0ppWWdaRzlqZFcxbGJuUXVaRzlqZFcxbGJuUkZiR1Z0Wlc1MExuTjBlV3hsSUNZbUlHUnZZM1Z0Wlc1MExtUnZZM1Z0Wlc1MFJXeGxiV1Z1ZEM1emRIbHNaUzVYWldKcmFYUkJjSEJsWVhKaGJtTmxLU0I4ZkZ4dUlDQWdJQzh2SUdseklHWnBjbVZpZFdjL0lHaDBkSEE2THk5emRHRmphMjkyWlhKbWJHOTNMbU52YlM5aEx6TTVPREV5TUM4ek56WTNOek5jYmlBZ0lDQW9kSGx3Wlc5bUlIZHBibVJ2ZHlBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NnSmlZZ2QybHVaRzkzTG1OdmJuTnZiR1VnSmlZZ0tIZHBibVJ2ZHk1amIyNXpiMnhsTG1acGNtVmlkV2NnZkh3Z0tIZHBibVJ2ZHk1amIyNXpiMnhsTG1WNFkyVndkR2x2YmlBbUppQjNhVzVrYjNjdVkyOXVjMjlzWlM1MFlXSnNaU2twS1NCOGZGeHVJQ0FnSUM4dklHbHpJR1pwY21WbWIzZ2dQajBnZGpNeFAxeHVJQ0FnSUM4dklHaDBkSEJ6T2k4dlpHVjJaV3h2Y0dWeUxtMXZlbWxzYkdFdWIzSm5MMlZ1TFZWVEwyUnZZM012Vkc5dmJITXZWMlZpWDBOdmJuTnZiR1VqVTNSNWJHbHVaMTl0WlhOellXZGxjMXh1SUNBZ0lDaDBlWEJsYjJZZ2JtRjJhV2RoZEc5eUlDRTlQU0FuZFc1a1pXWnBibVZrSnlBbUppQnVZWFpwWjJGMGIzSXVkWE5sY2tGblpXNTBJQ1ltSUc1aGRtbG5ZWFJ2Y2k1MWMyVnlRV2RsYm5RdWRHOU1iM2RsY2tOaGMyVW9LUzV0WVhSamFDZ3ZabWx5WldadmVGeGNMeWhjWEdRcktTOHBJQ1ltSUhCaGNuTmxTVzUwS0ZKbFowVjRjQzRrTVN3Z01UQXBJRDQ5SURNeEtTQjhmRnh1SUNBZ0lDOHZJR1J2ZFdKc1pTQmphR1ZqYXlCM1pXSnJhWFFnYVc0Z2RYTmxja0ZuWlc1MElHcDFjM1FnYVc0Z1kyRnpaU0IzWlNCaGNtVWdhVzRnWVNCM2IzSnJaWEpjYmlBZ0lDQW9kSGx3Wlc5bUlHNWhkbWxuWVhSdmNpQWhQVDBnSjNWdVpHVm1hVzVsWkNjZ0ppWWdibUYyYVdkaGRHOXlMblZ6WlhKQloyVnVkQ0FtSmlCdVlYWnBaMkYwYjNJdWRYTmxja0ZuWlc1MExuUnZURzkzWlhKRFlYTmxLQ2t1YldGMFkyZ29MMkZ3Y0d4bGQyVmlhMmwwWEZ3dktGeGNaQ3NwTHlrcE8xeHVmVnh1WEc0dktpcGNiaUFxSUUxaGNDQWxhaUIwYnlCZ1NsTlBUaTV6ZEhKcGJtZHBabmtvS1dBc0lITnBibU5sSUc1dklGZGxZaUJKYm5Od1pXTjBiM0p6SUdSdklIUm9ZWFFnWW5rZ1pHVm1ZWFZzZEM1Y2JpQXFMMXh1WEc1bGVIQnZjblJ6TG1admNtMWhkSFJsY25NdWFpQTlJR1oxYm1OMGFXOXVLSFlwSUh0Y2JpQWdkSEo1SUh0Y2JpQWdJQ0J5WlhSMWNtNGdTbE5QVGk1emRISnBibWRwWm5rb2RpazdYRzRnSUgwZ1kyRjBZMmdnS0dWeWNpa2dlMXh1SUNBZ0lISmxkSFZ5YmlBblcxVnVaWGh3WldOMFpXUktVMDlPVUdGeWMyVkZjbkp2Y2wwNklDY2dLeUJsY25JdWJXVnpjMkZuWlR0Y2JpQWdmVnh1ZlR0Y2JseHVYRzR2S2lwY2JpQXFJRU52Ykc5eWFYcGxJR3h2WnlCaGNtZDFiV1Z1ZEhNZ2FXWWdaVzVoWW14bFpDNWNiaUFxWEc0Z0tpQkFZWEJwSUhCMVlteHBZMXh1SUNvdlhHNWNibVoxYm1OMGFXOXVJR1p2Y20xaGRFRnlaM01vWVhKbmN5a2dlMXh1SUNCMllYSWdkWE5sUTI5c2IzSnpJRDBnZEdocGN5NTFjMlZEYjJ4dmNuTTdYRzVjYmlBZ1lYSm5jMXN3WFNBOUlDaDFjMlZEYjJ4dmNuTWdQeUFuSldNbklEb2dKeWNwWEc0Z0lDQWdLeUIwYUdsekxtNWhiV1Z6Y0dGalpWeHVJQ0FnSUNzZ0tIVnpaVU52Ykc5eWN5QS9JQ2NnSldNbklEb2dKeUFuS1Z4dUlDQWdJQ3NnWVhKbmMxc3dYVnh1SUNBZ0lDc2dLSFZ6WlVOdmJHOXljeUEvSUNjbFl5QW5JRG9nSnlBbktWeHVJQ0FnSUNzZ0p5c25JQ3NnWlhod2IzSjBjeTVvZFcxaGJtbDZaU2gwYUdsekxtUnBabVlwTzF4dVhHNGdJR2xtSUNnaGRYTmxRMjlzYjNKektTQnlaWFIxY200N1hHNWNiaUFnZG1GeUlHTWdQU0FuWTI5c2IzSTZJQ2NnS3lCMGFHbHpMbU52Ykc5eU8xeHVJQ0JoY21kekxuTndiR2xqWlNneExDQXdMQ0JqTENBblkyOXNiM0k2SUdsdWFHVnlhWFFuS1Z4dVhHNGdJQzh2SUhSb1pTQm1hVzVoYkNCY0lpVmpYQ0lnYVhNZ2MyOXRaWGRvWVhRZ2RISnBZMnQ1TENCaVpXTmhkWE5sSUhSb1pYSmxJR052ZFd4a0lHSmxJRzkwYUdWeVhHNGdJQzh2SUdGeVozVnRaVzUwY3lCd1lYTnpaV1FnWldsMGFHVnlJR0psWm05eVpTQnZjaUJoWm5SbGNpQjBhR1VnSldNc0lITnZJSGRsSUc1bFpXUWdkRzljYmlBZ0x5OGdabWxuZFhKbElHOTFkQ0IwYUdVZ1kyOXljbVZqZENCcGJtUmxlQ0IwYnlCcGJuTmxjblFnZEdobElFTlRVeUJwYm5SdlhHNGdJSFpoY2lCcGJtUmxlQ0E5SURBN1hHNGdJSFpoY2lCc1lYTjBReUE5SURBN1hHNGdJR0Z5WjNOYk1GMHVjbVZ3YkdGalpTZ3ZKVnRoTFhwQkxWb2xYUzluTENCbWRXNWpkR2x2YmlodFlYUmphQ2tnZTF4dUlDQWdJR2xtSUNnbkpTVW5JRDA5UFNCdFlYUmphQ2tnY21WMGRYSnVPMXh1SUNBZ0lHbHVaR1Y0S3lzN1hHNGdJQ0FnYVdZZ0tDY2xZeWNnUFQwOUlHMWhkR05vS1NCN1hHNGdJQ0FnSUNBdkx5QjNaU0J2Ym14NUlHRnlaU0JwYm5SbGNtVnpkR1ZrSUdsdUlIUm9aU0FxYkdGemRDb2dKV05jYmlBZ0lDQWdJQzh2SUNoMGFHVWdkWE5sY2lCdFlYa2dhR0YyWlNCd2NtOTJhV1JsWkNCMGFHVnBjaUJ2ZDI0cFhHNGdJQ0FnSUNCc1lYTjBReUE5SUdsdVpHVjRPMXh1SUNBZ0lIMWNiaUFnZlNrN1hHNWNiaUFnWVhKbmN5NXpjR3hwWTJVb2JHRnpkRU1zSURBc0lHTXBPMXh1ZlZ4dVhHNHZLaXBjYmlBcUlFbHVkbTlyWlhNZ1lHTnZibk52YkdVdWJHOW5LQ2xnSUhkb1pXNGdZWFpoYVd4aFlteGxMbHh1SUNvZ1RtOHRiM0FnZDJobGJpQmdZMjl1YzI5c1pTNXNiMmRnSUdseklHNXZkQ0JoSUZ3aVpuVnVZM1JwYjI1Y0lpNWNiaUFxWEc0Z0tpQkFZWEJwSUhCMVlteHBZMXh1SUNvdlhHNWNibVoxYm1OMGFXOXVJR3h2WnlncElIdGNiaUFnTHk4Z2RHaHBjeUJvWVdOclpYSjVJR2x6SUhKbGNYVnBjbVZrSUdadmNpQkpSVGd2T1N3Z2QyaGxjbVZjYmlBZ0x5OGdkR2hsSUdCamIyNXpiMnhsTG14dloyQWdablZ1WTNScGIyNGdaRzlsYzI0bmRDQm9ZWFpsSUNkaGNIQnNlU2RjYmlBZ2NtVjBkWEp1SUNkdlltcGxZM1FuSUQwOVBTQjBlWEJsYjJZZ1kyOXVjMjlzWlZ4dUlDQWdJQ1ltSUdOdmJuTnZiR1V1Ykc5blhHNGdJQ0FnSmlZZ1JuVnVZM1JwYjI0dWNISnZkRzkwZVhCbExtRndjR3g1TG1OaGJHd29ZMjl1YzI5c1pTNXNiMmNzSUdOdmJuTnZiR1VzSUdGeVozVnRaVzUwY3lrN1hHNTlYRzVjYmk4cUtseHVJQ29nVTJGMlpTQmdibUZ0WlhOd1lXTmxjMkF1WEc0Z0tseHVJQ29nUUhCaGNtRnRJSHRUZEhKcGJtZDlJRzVoYldWemNHRmpaWE5jYmlBcUlFQmhjR2tnY0hKcGRtRjBaVnh1SUNvdlhHNWNibVoxYm1OMGFXOXVJSE5oZG1Vb2JtRnRaWE53WVdObGN5a2dlMXh1SUNCMGNua2dlMXh1SUNBZ0lHbG1JQ2h1ZFd4c0lEMDlJRzVoYldWemNHRmpaWE1wSUh0Y2JpQWdJQ0FnSUdWNGNHOXlkSE11YzNSdmNtRm5aUzV5WlcxdmRtVkpkR1Z0S0Nka1pXSjFaeWNwTzF4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQmxlSEJ2Y25SekxuTjBiM0poWjJVdVpHVmlkV2NnUFNCdVlXMWxjM0JoWTJWek8xeHVJQ0FnSUgxY2JpQWdmU0JqWVhSamFDaGxLU0I3ZlZ4dWZWeHVYRzR2S2lwY2JpQXFJRXh2WVdRZ1lHNWhiV1Z6Y0dGalpYTmdMbHh1SUNwY2JpQXFJRUJ5WlhSMWNtNGdlMU4wY21sdVozMGdjbVYwZFhKdWN5QjBhR1VnY0hKbGRtbHZkWE5zZVNCd1pYSnphWE4wWldRZ1pHVmlkV2NnYlc5a1pYTmNiaUFxSUVCaGNHa2djSEpwZG1GMFpWeHVJQ292WEc1Y2JtWjFibU4wYVc5dUlHeHZZV1FvS1NCN1hHNGdJSFpoY2lCeU8xeHVJQ0IwY25rZ2UxeHVJQ0FnSUhJZ1BTQmxlSEJ2Y25SekxuTjBiM0poWjJVdVpHVmlkV2M3WEc0Z0lIMGdZMkYwWTJnb1pTa2dlMzFjYmx4dUlDQXZMeUJKWmlCa1pXSjFaeUJwYzI0bmRDQnpaWFFnYVc0Z1RGTXNJR0Z1WkNCM1pTZHlaU0JwYmlCRmJHVmpkSEp2Yml3Z2RISjVJSFJ2SUd4dllXUWdKRVJGUWxWSFhHNGdJR2xtSUNnaGNpQW1KaUIwZVhCbGIyWWdjSEp2WTJWemN5QWhQVDBnSjNWdVpHVm1hVzVsWkNjZ0ppWWdKMlZ1ZGljZ2FXNGdjSEp2WTJWemN5a2dlMXh1SUNBZ0lISWdQU0J3Y205alpYTnpMbVZ1ZGk1RVJVSlZSenRjYmlBZ2ZWeHVYRzRnSUhKbGRIVnliaUJ5TzF4dWZWeHVYRzR2S2lwY2JpQXFJRVZ1WVdKc1pTQnVZVzFsYzNCaFkyVnpJR3hwYzNSbFpDQnBiaUJnYkc5allXeFRkRzl5WVdkbExtUmxZblZuWUNCcGJtbDBhV0ZzYkhrdVhHNGdLaTljYmx4dVpYaHdiM0owY3k1bGJtRmliR1VvYkc5aFpDZ3BLVHRjYmx4dUx5b3FYRzRnS2lCTWIyTmhiSE4wYjNKaFoyVWdZWFIwWlcxd2RITWdkRzhnY21WMGRYSnVJSFJvWlNCc2IyTmhiSE4wYjNKaFoyVXVYRzRnS2x4dUlDb2dWR2hwY3lCcGN5QnVaV05sYzNOaGNua2dZbVZqWVhWelpTQnpZV1poY21rZ2RHaHliM2R6WEc0Z0tpQjNhR1Z1SUdFZ2RYTmxjaUJrYVhOaFlteGxjeUJqYjI5cmFXVnpMMnh2WTJGc2MzUnZjbUZuWlZ4dUlDb2dZVzVrSUhsdmRTQmhkSFJsYlhCMElIUnZJR0ZqWTJWemN5QnBkQzVjYmlBcVhHNGdLaUJBY21WMGRYSnVJSHRNYjJOaGJGTjBiM0poWjJWOVhHNGdLaUJBWVhCcElIQnlhWFpoZEdWY2JpQXFMMXh1WEc1bWRXNWpkR2x2YmlCc2IyTmhiSE4wYjNKaFoyVW9LU0I3WEc0Z0lIUnllU0I3WEc0Z0lDQWdjbVYwZFhKdUlIZHBibVJ2ZHk1c2IyTmhiRk4wYjNKaFoyVTdYRzRnSUgwZ1kyRjBZMmdnS0dVcElIdDlYRzU5WEc0aVhYMD0iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVidWcuZGVidWcgPSBjcmVhdGVEZWJ1Z1snZGVmYXVsdCddID0gY3JlYXRlRGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBBY3RpdmUgYGRlYnVnYCBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydHMuaW5zdGFuY2VzID0gW107XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcywgYW5kIG5hbWVzIHRvIHNraXAuXG4gKi9cblxuZXhwb3J0cy5uYW1lcyA9IFtdO1xuZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4vKipcbiAqIE1hcCBvZiBzcGVjaWFsIFwiJW5cIiBoYW5kbGluZyBmdW5jdGlvbnMsIGZvciB0aGUgZGVidWcgXCJmb3JtYXRcIiBhcmd1bWVudC5cbiAqXG4gKiBWYWxpZCBrZXkgbmFtZXMgYXJlIGEgc2luZ2xlLCBsb3dlciBvciB1cHBlci1jYXNlIGxldHRlciwgaS5lLiBcIm5cIiBhbmQgXCJOXCIuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzID0ge307XG5cbi8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZWxlY3RDb2xvcihuYW1lc3BhY2UpIHtcbiAgdmFyIGhhc2ggPSAwLCBpO1xuXG4gIGZvciAoaSBpbiBuYW1lc3BhY2UpIHtcbiAgICBoYXNoICA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgbmFtZXNwYWNlLmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgfVxuXG4gIHJldHVybiBleHBvcnRzLmNvbG9yc1tNYXRoLmFicyhoYXNoKSAlIGV4cG9ydHMuY29sb3JzLmxlbmd0aF07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVzcGFjZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZURlYnVnKG5hbWVzcGFjZSkge1xuXG4gIHZhciBwcmV2VGltZTtcblxuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAvLyBkaXNhYmxlZD9cbiAgICBpZiAoIWRlYnVnLmVuYWJsZWQpIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gZGVidWc7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIHR1cm4gdGhlIGBhcmd1bWVudHNgIGludG8gYSBwcm9wZXIgQXJyYXlcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgYXJnc1swXSA9IGV4cG9ydHMuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgYXJnc1swXSkge1xuICAgICAgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJU9cbiAgICAgIGFyZ3MudW5zaGlmdCgnJU8nKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16QS1aJV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgLy8gYXBwbHkgZW52LXNwZWNpZmljIGZvcm1hdHRpbmcgKGNvbG9ycywgZXRjLilcbiAgICBleHBvcnRzLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcblxuICAgIHZhciBsb2dGbiA9IGRlYnVnLmxvZyB8fCBleHBvcnRzLmxvZyB8fCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG5cbiAgZGVidWcubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICBkZWJ1Zy5lbmFibGVkID0gZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSk7XG4gIGRlYnVnLnVzZUNvbG9ycyA9IGV4cG9ydHMudXNlQ29sb3JzKCk7XG4gIGRlYnVnLmNvbG9yID0gc2VsZWN0Q29sb3IobmFtZXNwYWNlKTtcbiAgZGVidWcuZGVzdHJveSA9IGRlc3Ryb3k7XG5cbiAgLy8gZW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmluaXQpIHtcbiAgICBleHBvcnRzLmluaXQoZGVidWcpO1xuICB9XG5cbiAgZXhwb3J0cy5pbnN0YW5jZXMucHVzaChkZWJ1Zyk7XG5cbiAgcmV0dXJuIGRlYnVnO1xufVxuXG5mdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgdmFyIGluZGV4ID0gZXhwb3J0cy5pbnN0YW5jZXMuaW5kZXhPZih0aGlzKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIGV4cG9ydHMuaW5zdGFuY2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICBleHBvcnRzLnNhdmUobmFtZXNwYWNlcyk7XG5cbiAgZXhwb3J0cy5uYW1lcyA9IFtdO1xuICBleHBvcnRzLnNraXBzID0gW107XG5cbiAgdmFyIGk7XG4gIHZhciBzcGxpdCA9ICh0eXBlb2YgbmFtZXNwYWNlcyA9PT0gJ3N0cmluZycgPyBuYW1lc3BhY2VzIDogJycpLnNwbGl0KC9bXFxzLF0rLyk7XG4gIHZhciBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKCFzcGxpdFtpXSkgY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG4gICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVzcGFjZXNbMF0gPT09ICctJykge1xuICAgICAgZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBleHBvcnRzLmluc3RhbmNlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbnN0YW5jZSA9IGV4cG9ydHMuaW5zdGFuY2VzW2ldO1xuICAgIGluc3RhbmNlLmVuYWJsZWQgPSBleHBvcnRzLmVuYWJsZWQoaW5zdGFuY2UubmFtZXNwYWNlKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZXhwb3J0cy5lbmFibGUoJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlZChuYW1lKSB7XG4gIGlmIChuYW1lW25hbWUubGVuZ3RoIC0gMV0gPT09ICcqJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHkgPSBkICogMzY1LjI1O1xuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc05hTih2YWwpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBvcHRpb25zLmxvbmcgPyBmbXRMb25nKHZhbCkgOiBmbXRTaG9ydCh2YWwpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICtcbiAgICAgIEpTT04uc3RyaW5naWZ5KHZhbClcbiAgKTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhcbiAgICBzdHJcbiAgKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd5ZWFycyc6XG4gICAgY2FzZSAneWVhcic6XG4gICAgY2FzZSAneXJzJzpcbiAgICBjYXNlICd5cic6XG4gICAgY2FzZSAneSc6XG4gICAgICByZXR1cm4gbiAqIHk7XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZDtcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGg7XG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogcztcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG47XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gZCkgKyAnZCc7XG4gIH1cbiAgaWYgKG1zID49IGgpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnO1xuICB9XG4gIGlmIChtcyA+PSBtKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJztcbiAgfVxuICBpZiAobXMgPj0gcykge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gcykgKyAncyc7XG4gIH1cbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgcmV0dXJuIHBsdXJhbChtcywgZCwgJ2RheScpIHx8XG4gICAgcGx1cmFsKG1zLCBoLCAnaG91cicpIHx8XG4gICAgcGx1cmFsKG1zLCBtLCAnbWludXRlJykgfHxcbiAgICBwbHVyYWwobXMsIHMsICdzZWNvbmQnKSB8fFxuICAgIG1zICsgJyBtcyc7XG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKG1zIDwgbiAqIDEuNSkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKG1zIC8gbikgKyAnICcgKyBuYW1lO1xuICB9XG4gIHJldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncyc7XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiaW1wb3J0IGRlYnVnTG9nZ2VyIGZyb20gJ2RlYnVnJztcclxuY29uc3QgZGVidWcgPSBkZWJ1Z0xvZ2dlcigncGhhc2VyLW1vdmUtYW5kLXN0b3AtcGx1Z2luOm1vdmVBbmRTdG9wJyk7XHJcbmNvbnN0IGRlYnVnT2JqZWN0VG9Nb3ZlID0gKG9iamVjdHNUb01vdmUsIG9iamVjdFRvTW92ZSwgbGFiZWwpID0+IGRlYnVnKGAke29iamVjdHNUb01vdmUuaW5kZXhPZihvYmplY3RUb01vdmUpfTogJHtsYWJlbH1gKTtcclxuXHJcbmNvbnN0IFNUQVRFID0ge1xyXG5cdGlzTW92aW5nOiAnaXNNb3ZpbmcnLFxyXG5cdGhhc1N0b3BwZWQ6ICdoYXNTdG9wcGVkJ1xyXG59O1xyXG5cclxuZnVuY3Rpb24gZmluZE9iamVjdFRvTW92ZShvYmplY3RzVG9Nb3ZlLCBkaXNwbGF5T2JqZWN0KSB7XHJcblx0aWYgKGRpc3BsYXlPYmplY3QpIHtcclxuXHRcdHJldHVybiBvYmplY3RzVG9Nb3ZlLmZpbmQob2JqZWN0VG9Nb3ZlID0+IG9iamVjdFRvTW92ZS5kaXNwbGF5T2JqZWN0ID09PSBkaXNwbGF5T2JqZWN0KTtcclxuXHR9XHJcblx0cmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkRGlzcGxheU9iamVjdFRvTGlzdChvYmplY3RzVG9Nb3ZlLCBkaXNwbGF5T2JqZWN0LCBpbmZvID0ge30pIHtcclxuXHRjb25zdCBvYmplY3RUb01vdmUgPSB7XHJcblx0XHRkaXNwbGF5T2JqZWN0LFxyXG5cdFx0aW5mb1xyXG5cdH07XHJcblx0b2JqZWN0c1RvTW92ZS5wdXNoKG9iamVjdFRvTW92ZSk7XHJcblx0ZGVidWdPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgb2JqZWN0VG9Nb3ZlLCBgYWRkRGlzcGxheU9iamVjdFRvTGlzdCB4OiR7aW5mby54fSB5OiR7aW5mby55fSBzcGVlZDoke2luZm8uc3BlZWR9IG1heFRpbWU6JHtpbmZvLm1heFRpbWV9IGV2ZW50czoke2luZm8uZXZlbnRzID8gT2JqZWN0LmtleXMoaW5mby5ldmVudHMpIDogaW5mby5ldmVudHN9YCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZU9iamVjdFRvTW92ZShvYmplY3RzVG9Nb3ZlLCBvYmplY3RUb01vdmUpIHtcclxuXHRkZWJ1Z09iamVjdFRvTW92ZShvYmplY3RzVG9Nb3ZlLCBvYmplY3RUb01vdmUsIFwicmVtb3ZlT2JqZWN0VG9Nb3ZlXCIpO1xyXG5cdGlmIChvYmplY3RUb01vdmUpIHtcclxuXHRcdGNvbnN0IGluZGV4ID0gb2JqZWN0c1RvTW92ZS5pbmRleE9mKG9iamVjdFRvTW92ZSk7XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRvYmplY3RzVG9Nb3ZlLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBzdG9wT2JqZWN0TW92ZW1lbnQob2JqZWN0VG9Nb3ZlKSB7XHJcblx0Y29uc3QgeyBkaXNwbGF5T2JqZWN0LCBpbmZvIH0gPSBvYmplY3RUb01vdmU7XHJcblx0ZGlzcGxheU9iamVjdC5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG5cdGRpc3BsYXlPYmplY3QuYm9keS52ZWxvY2l0eS55ID0gMDtcclxuXHJcblx0aWYgKGluZm8uZXZlbnRzKSB7XHJcblx0XHRpZiAoaW5mby5ldmVudHMub25Qb3NpdGlvblJlYWNoZWQpIHtcclxuXHRcdFx0aW5mby5ldmVudHMub25Qb3NpdGlvblJlYWNoZWQoZGlzcGxheU9iamVjdCk7XHJcblx0XHR9XHJcblx0XHRpZiAoaW5mby5ldmVudHMub25TdG9wcGVkKSB7XHJcblx0XHRcdGluZm8uZXZlbnRzLm9uU3RvcHBlZChkaXNwbGF5T2JqZWN0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGluZm8ubW92ZSA9IFNUQVRFLmhhc1N0b3BwZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZU9iamVjdE1vdmVtZW50KGdhbWUsIG9iamVjdFRvTW92ZSkge1xyXG5cdGNvbnN0IHsgZGlzcGxheU9iamVjdCwgaW5mbyB9ID0gb2JqZWN0VG9Nb3ZlO1xyXG5cdGlmIChkaXNwbGF5T2JqZWN0LmFsaXZlICYmIGluZm8ubW92ZURpc3RGcm9tVGFyZ2V0ICYmIGRpc3BsYXlPYmplY3QuYm9keSkge1xyXG5cclxuXHRcdGlmIChpc01vdmluZyhvYmplY3RUb01vdmUpKSB7XHJcblx0XHRcdGNvbnN0IHVwZGF0ZWREaXN0ID0gZ2FtZS5waHlzaWNzLmFyY2FkZS5kaXN0YW5jZVRvWFkoZGlzcGxheU9iamVjdCwgaW5mby54LCBpbmZvLnkpO1xyXG5cdFx0XHRpZiAodXBkYXRlZERpc3QgPT09IDAgfHwgdXBkYXRlZERpc3QgPiBpbmZvLm1vdmVEaXN0RnJvbVRhcmdldCkge1xyXG5cdFx0XHRcdC8vIGlmIGRpc3BsYXlPYmplY3QgaXMgc3RpbGwgbW92aW5nLCB3ZSBhc2sgdG8gcGFoc2VyIHRvIHN0b3AgaXQgKHN0b3AgdmVsb2NpdHkpXHJcblx0XHRcdFx0c3RvcE9iamVjdE1vdmVtZW50KG9iamVjdFRvTW92ZSk7XHJcblx0XHRcdFx0Ly8gdXBkYXRlIGNvb3JkaW5hdGVzXHJcblx0XHRcdFx0ZGlzcGxheU9iamVjdC54ID0gaW5mby54O1xyXG5cdFx0XHRcdGRpc3BsYXlPYmplY3QueSA9IGluZm8ueTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvL2lmIG5vdCBzdG9wcGVkLCBvciBubyBuZWVkIHRvIHN0b3AsIHdlIHVwZGF0ZSBsYXN0IGRpc3RhbmNlIGJldHdlZW4gY3VycmVudCBkaXNwbGF5T2JqZWN0IGFuZCB0YXJnZXR0ZWQgY29ycmRpbmF0ZXNcclxuXHRcdFx0XHRpbmZvLm1vdmVEaXN0RnJvbVRhcmdldCA9IHVwZGF0ZWREaXN0O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBpc01vdmluZyhvYmplY3RUb01vdmUpIHtcclxuXHRjb25zdCB7IGluZm8gfSA9IG9iamVjdFRvTW92ZTtcclxuXHRyZXR1cm4gaW5mby5tb3ZlID09PSBTVEFURS5pc01vdmluZztcclxufVxyXG5cclxuZnVuY3Rpb24gaGFzU3RvcHBlZChvYmplY3RUb01vdmUpIHtcclxuXHRjb25zdCB7IGluZm8gfSA9IG9iamVjdFRvTW92ZTtcclxuXHRyZXR1cm4gaW5mby5tb3ZlID09PSBTVEFURS5oYXNTdG9wcGVkO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcG9zdFVwZGF0ZShvYmplY3RzVG9Nb3ZlLCBnYW1lKSB7XHJcblx0Y29uc3Qgb2JqZWN0c05vdEFsaXZlID0gW107XHJcblx0b2JqZWN0c1RvTW92ZS5mb3JFYWNoKG9iamVjdFRvTW92ZSA9PiB7XHJcblx0XHRjb25zdCB7IGRpc3BsYXlPYmplY3QsIGluZm8gfSA9IG9iamVjdFRvTW92ZTtcclxuXHRcdGlmICghZGlzcGxheU9iamVjdCB8fCAhZGlzcGxheU9iamVjdC5hbGl2ZSB8fCBoYXNTdG9wcGVkKG9iamVjdFRvTW92ZSkpIHtcclxuXHRcdFx0aWYgKGluZm8gJiYgaW5mby5ldmVudHMpIHtcclxuXHRcdFx0XHRpZiAoaW5mby5ldmVudHMub25TdG9wcGVkKSB7XHJcblx0XHRcdFx0XHRpbmZvLmV2ZW50cy5vblN0b3BwZWQoZGlzcGxheU9iamVjdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdG9iamVjdHNOb3RBbGl2ZS5wdXNoKG9iamVjdFRvTW92ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR1cGRhdGVPYmplY3RNb3ZlbWVudChnYW1lLCBvYmplY3RUb01vdmUpO1xyXG5cdFx0XHRpZiAoaGFzU3RvcHBlZChvYmplY3RUb01vdmUpKSB7XHJcblx0XHRcdFx0b2JqZWN0c05vdEFsaXZlLnB1c2gob2JqZWN0VG9Nb3ZlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHRvYmplY3RzTm90QWxpdmUuZm9yRWFjaChvYmplY3RUb01vdmUgPT4ge1xyXG5cdFx0cmVtb3ZlT2JqZWN0VG9Nb3ZlKG9iamVjdHNUb01vdmUsIG9iamVjdFRvTW92ZSk7XHJcblx0fSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZW1Nb3ZpbmcoZGlzcGxheU9iamVjdCkge1xyXG5cdGlmICghZGlzcGxheU9iamVjdCkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGlzIHVuZGVmaW5lZFwiKTtcclxuXHR9XHJcblx0cmV0dXJuIGRpc3BsYXlPYmplY3QuYm9keVxyXG5cdFx0JiYgZGlzcGxheU9iamVjdC5ib2R5LnZlbG9jaXR5XHJcblx0XHQmJiAoZGlzcGxheU9iamVjdC5ib2R5LnZlbG9jaXR5LnggfHwgZGlzcGxheU9iamVjdC5ib2R5LnZlbG9jaXR5LnkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbW92ZVRvWFkob2JqZWN0c1RvTW92ZSwgZ2FtZSwgZGlzcGxheU9iamVjdCwgeCwgeSwgc3BlZWQsIG1heFRpbWUsIGV2ZW50cykge1xyXG5cdGlmIChkaXNwbGF5T2JqZWN0ICYmIGRpc3BsYXlPYmplY3QuYWxpdmUgJiYgZGlzcGxheU9iamVjdC5ib2R5KSB7XHJcblx0XHRjb25zdCBvYmplY3RUb01vdmUgPSBmaW5kT2JqZWN0VG9Nb3ZlKG9iamVjdHNUb01vdmUsIGRpc3BsYXlPYmplY3QpO1xyXG5cclxuXHRcdGlmICghb2JqZWN0VG9Nb3ZlIHx8IChcclxuXHRcdFx0b2JqZWN0VG9Nb3ZlLmluZm8ueCAhPT0geCB8fFxyXG5cdFx0XHRvYmplY3RUb01vdmUuaW5mby55ICE9PSB5IHx8XHJcblx0XHRcdG9iamVjdFRvTW92ZS5pbmZvLnNwZWVkICE9PSBzcGVlZCB8fFxyXG5cdFx0XHRvYmplY3RUb01vdmUuaW5mby5tYXhUaW1lICE9PSBtYXhUaW1lIHx8XHJcblx0XHRcdG9iamVjdFRvTW92ZS5pbmZvLmV2ZW50cyAhPT0gZXZlbnRzXHJcblx0XHQpKSB7XHJcblx0XHRcdGlmIChvYmplY3RUb01vdmUpIHtcclxuXHRcdFx0XHRyZW1vdmVPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgb2JqZWN0VG9Nb3ZlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjb25zdCBtb3ZlRGlzdEZyb21UYXJnZXQgPSBnYW1lLnBoeXNpY3MuYXJjYWRlLmRpc3RhbmNlVG9YWShkaXNwbGF5T2JqZWN0LCB4LCB5KTtcclxuXHRcdFx0YWRkRGlzcGxheU9iamVjdFRvTGlzdChvYmplY3RzVG9Nb3ZlLCBkaXNwbGF5T2JqZWN0LCB7XHJcblx0XHRcdFx0bW92ZTogU1RBVEUuaXNNb3ZpbmcsXHJcblx0XHRcdFx0eCxcclxuXHRcdFx0XHR5LFxyXG5cdFx0XHRcdHNwZWVkLFxyXG5cdFx0XHRcdG1heFRpbWUsXHJcblx0XHRcdFx0ZXZlbnRzLFxyXG5cdFx0XHRcdG1vdmVEaXN0RnJvbVRhcmdldCxcclxuXHRcdFx0XHRtb3ZlRGlzdEZyb21UYXJnZXRPcmlnaW46IG1vdmVEaXN0RnJvbVRhcmdldFxyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIGdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvWFkoZGlzcGxheU9iamVjdCwgeCwgeSwgc3BlZWQsIG1heFRpbWUpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVUb09iamVjdChvYmplY3RzVG9Nb3ZlLCBnYW1lLCBkaXNwbGF5T2JqZWN0LCBkZXN0aW5hdGlvbiwgc3BlZWQsIG1heFRpbWUsIGV2ZW50cykge1xyXG5cdHJldHVybiBtb3ZlVG9YWShvYmplY3RzVG9Nb3ZlLCBnYW1lLCBkaXNwbGF5T2JqZWN0LCBkZXN0aW5hdGlvbi54LCBkZXN0aW5hdGlvbi55LCBzcGVlZCwgbWF4VGltZSwgZXZlbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN0b3BUb01vdmUob2JqZWN0c1RvTW92ZSwgZGlzcGxheU9iamVjdCkge1xyXG5cdGNvbnN0IG9iamVjdFRvTW92ZSA9IGZpbmRPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgZGlzcGxheU9iamVjdCk7XHJcblx0aWYgKG9iamVjdFRvTW92ZSkge1xyXG5cdFx0aWYgKGlzTW92aW5nKG9iamVjdFRvTW92ZSkpIHtcclxuXHRcdFx0c3RvcE9iamVjdE1vdmVtZW50KG9iamVjdFRvTW92ZSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiJdfQ==
