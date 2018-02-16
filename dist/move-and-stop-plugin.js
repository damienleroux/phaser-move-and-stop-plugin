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
				// update coordinates
				displayObject.x = info.x;
				displayObject.y = info.y;

				// if displayObject is still moving, we ask to pahser to stop it (stop velocity)
				stopObjectMovement(objectToMove);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1VzZXJzL2RhbWllbi9Eb2N1bWVudHMvd29ya3NwYWNlL3BoYXNlci1tb3ZlLWFuZC1zdG9wLXBsdWdpbi9zcmMvbW92ZS1hbmQtc3RvcC1wbHVnaW4uanMiLCJub2RlX21vZHVsZXNcXGRlYnVnXFxzcmNcXGJyb3dzZXIuanMiLCJub2RlX21vZHVsZXNcXGRlYnVnXFxzcmNcXGRlYnVnLmpzIiwibm9kZV9tb2R1bGVzXFxtc1xcaW5kZXguanMiLCJub2RlX21vZHVsZXNcXHByb2Nlc3NcXGJyb3dzZXIuanMiLCJDOi9Vc2Vycy9kYW1pZW4vRG9jdW1lbnRzL3dvcmtzcGFjZS9waGFzZXItbW92ZS1hbmQtc3RvcC1wbHVnaW4vc3JjL21vdmUtYW5kLXN0b3AtY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OytCQ01PLHNCQUFzQjs7SUFMNUIsVUFBVSxvQkFBVixVQUFVO0lBQ1YsWUFBWSxvQkFBWixZQUFZO0lBQ1osUUFBUSxvQkFBUixRQUFRO0lBQ1IsWUFBWSxvQkFBWixZQUFZO0lBQ1osVUFBVSxvQkFBVixVQUFVOzs7O0FBS1gsU0FBUyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUNsQyxPQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZDLEtBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLEtBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0NBQ25COztBQUVELFdBQVcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUvRCxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLFdBQVcsR0FBRztBQUN6RCxRQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNqRCxDQUFDOzs7O0FBSUYsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDdkYsUUFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDNUYsQ0FBQzs7QUFFRixXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLFFBQVEsQ0FBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQ3RHLFFBQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDdkcsQ0FBQzs7QUFFRixXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDekQsUUFBTyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztDQUNyRCxDQUFDOzs7O0FBSUYsV0FBVyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBQyxhQUFhLEVBQUs7QUFDdkQsUUFBTyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7Q0FDbkMsQ0FBQzs7aUJBRWEsV0FBVzs7O0FDMUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUU7QUFDM0IscUJBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDakM7RUFDRDtDQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7XHJcblx0cG9zdFVwZGF0ZSxcclxuXHRpc0l0ZW1Nb3ZpbmcsXHJcblx0bW92ZVRvWFksXHJcblx0bW92ZVRvT2JqZWN0LFxyXG5cdHN0b3BUb01vdmVcclxufSBmcm9tICcuL21vdmUtYW5kLXN0b3AtY29yZSc7XHJcblxyXG4vL1BsdWdpbiBDb3JlIGRlZmluaXRpb25cclxuXHJcbmZ1bmN0aW9uIE1vdmVBbmRTdG9wKGdhbWUsIHBhcmVudCkge1xyXG5cdFBoYXNlci5QbHVnaW4uY2FsbCh0aGlzLCBnYW1lLCBwYXJlbnQpO1xyXG5cdHRoaXMub2JqZWN0c1RvTW92ZSA9IFtdO1xyXG5cdHRoaXMuYWN0aXZlID0gdHJ1ZTsgLy9lbmFibGUgcmVVcGRhdGUgYW5kIHVwZGF0ZSBtZXRob2RzIGNhbGxlZCBieSB0aGUgcGFyZW50XHJcbn1cclxuXHJcbk1vdmVBbmRTdG9wLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGhhc2VyLlBsdWdpbi5wcm90b3R5cGUpO1xyXG5cclxuTW92ZUFuZFN0b3AucHJvdG90eXBlLnBvc3RVcGRhdGUgPSBmdW5jdGlvbiBwb3N0VXBkYXRlXygpIHtcclxuXHRyZXR1cm4gcG9zdFVwZGF0ZSh0aGlzLm9iamVjdHNUb01vdmUsIHRoaXMuZ2FtZSk7XHJcbn07XHJcblxyXG4vL1BsdWdpbiBtb3ZpbmcgZnVuY3Rpb25zXHJcblxyXG5Nb3ZlQW5kU3RvcC5wcm90b3R5cGUudG9YWSA9IGZ1bmN0aW9uIHRvWFkoZGlzcGxheU9iamVjdCwgeCwgeSwgc3BlZWQsIG1heFRpbWUsIGV2ZW50cykge1xyXG5cdHJldHVybiBtb3ZlVG9YWSh0aGlzLm9iamVjdHNUb01vdmUsIHRoaXMuZ2FtZSwgZGlzcGxheU9iamVjdCwgeCwgeSwgc3BlZWQsIG1heFRpbWUsIGV2ZW50cyk7XHJcbn07XHJcblxyXG5Nb3ZlQW5kU3RvcC5wcm90b3R5cGUudG9PYmplY3QgPSBmdW5jdGlvbiB0b09iamVjdChkaXNwbGF5T2JqZWN0LCBkZXN0aW5hdGlvbiwgc3BlZWQsIG1heFRpbWUsIGV2ZW50cykge1xyXG5cdHJldHVybiBtb3ZlVG9PYmplY3QodGhpcy5vYmplY3RzVG9Nb3ZlLCB0aGlzLmdhbWUsIGRpc3BsYXlPYmplY3QsIGRlc3RpbmF0aW9uLCBzcGVlZCwgbWF4VGltZSwgZXZlbnRzKTtcclxufTtcclxuXHJcbk1vdmVBbmRTdG9wLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gc3RvcChkaXNwbGF5T2JqZWN0KSB7XHJcblx0cmV0dXJuIHN0b3BUb01vdmUodGhpcy5vYmplY3RzVG9Nb3ZlLCBkaXNwbGF5T2JqZWN0KTtcclxufTtcclxuXHJcbi8vIFV0aWxzXHJcblxyXG5Nb3ZlQW5kU3RvcC5wcm90b3R5cGUuaXNJdGVtTW92aW5nID0gKGRpc3BsYXlPYmplY3QpID0+IHtcclxuXHRyZXR1cm4gaXNJdGVtTW92aW5nKGRpc3BsYXlPYmplY3QpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW92ZUFuZFN0b3A7XHJcbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vKipcbiAqIFRoaXMgaXMgdGhlIHdlYiBicm93c2VyIGltcGxlbWVudGF0aW9uIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG5leHBvcnRzLmZvcm1hdEFyZ3MgPSBmb3JtYXRBcmdzO1xuZXhwb3J0cy5zYXZlID0gc2F2ZTtcbmV4cG9ydHMubG9hZCA9IGxvYWQ7XG5leHBvcnRzLnVzZUNvbG9ycyA9IHVzZUNvbG9ycztcbmV4cG9ydHMuc3RvcmFnZSA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWVcbiAgICAgICAgICAgICAgICYmICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWUuc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgPyBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICAgICAgICAgICAgICAgICAgOiBsb2NhbHN0b3JhZ2UoKTtcblxuLyoqXG4gKiBDb2xvcnMuXG4gKi9cblxuZXhwb3J0cy5jb2xvcnMgPSBbXG4gICcjMDAwMENDJywgJyMwMDAwRkYnLCAnIzAwMzNDQycsICcjMDAzM0ZGJywgJyMwMDY2Q0MnLCAnIzAwNjZGRicsICcjMDA5OUNDJyxcbiAgJyMwMDk5RkYnLCAnIzAwQ0MwMCcsICcjMDBDQzMzJywgJyMwMENDNjYnLCAnIzAwQ0M5OScsICcjMDBDQ0NDJywgJyMwMENDRkYnLFxuICAnIzMzMDBDQycsICcjMzMwMEZGJywgJyMzMzMzQ0MnLCAnIzMzMzNGRicsICcjMzM2NkNDJywgJyMzMzY2RkYnLCAnIzMzOTlDQycsXG4gICcjMzM5OUZGJywgJyMzM0NDMDAnLCAnIzMzQ0MzMycsICcjMzNDQzY2JywgJyMzM0NDOTknLCAnIzMzQ0NDQycsICcjMzNDQ0ZGJyxcbiAgJyM2NjAwQ0MnLCAnIzY2MDBGRicsICcjNjYzM0NDJywgJyM2NjMzRkYnLCAnIzY2Q0MwMCcsICcjNjZDQzMzJywgJyM5OTAwQ0MnLFxuICAnIzk5MDBGRicsICcjOTkzM0NDJywgJyM5OTMzRkYnLCAnIzk5Q0MwMCcsICcjOTlDQzMzJywgJyNDQzAwMDAnLCAnI0NDMDAzMycsXG4gICcjQ0MwMDY2JywgJyNDQzAwOTknLCAnI0NDMDBDQycsICcjQ0MwMEZGJywgJyNDQzMzMDAnLCAnI0NDMzMzMycsICcjQ0MzMzY2JyxcbiAgJyNDQzMzOTknLCAnI0NDMzNDQycsICcjQ0MzM0ZGJywgJyNDQzY2MDAnLCAnI0NDNjYzMycsICcjQ0M5OTAwJywgJyNDQzk5MzMnLFxuICAnI0NDQ0MwMCcsICcjQ0NDQzMzJywgJyNGRjAwMDAnLCAnI0ZGMDAzMycsICcjRkYwMDY2JywgJyNGRjAwOTknLCAnI0ZGMDBDQycsXG4gICcjRkYwMEZGJywgJyNGRjMzMDAnLCAnI0ZGMzMzMycsICcjRkYzMzY2JywgJyNGRjMzOTknLCAnI0ZGMzNDQycsICcjRkYzM0ZGJyxcbiAgJyNGRjY2MDAnLCAnI0ZGNjYzMycsICcjRkY5OTAwJywgJyNGRjk5MzMnLCAnI0ZGQ0MwMCcsICcjRkZDQzMzJ1xuXTtcblxuLyoqXG4gKiBDdXJyZW50bHkgb25seSBXZWJLaXQtYmFzZWQgV2ViIEluc3BlY3RvcnMsIEZpcmVmb3ggPj0gdjMxLFxuICogYW5kIHRoZSBGaXJlYnVnIGV4dGVuc2lvbiAoYW55IEZpcmVmb3ggdmVyc2lvbikgYXJlIGtub3duXG4gKiB0byBzdXBwb3J0IFwiJWNcIiBDU1MgY3VzdG9taXphdGlvbnMuXG4gKlxuICogVE9ETzogYWRkIGEgYGxvY2FsU3RvcmFnZWAgdmFyaWFibGUgdG8gZXhwbGljaXRseSBlbmFibGUvZGlzYWJsZSBjb2xvcnNcbiAqL1xuXG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG4gIC8vIE5COiBJbiBhbiBFbGVjdHJvbiBwcmVsb2FkIHNjcmlwdCwgZG9jdW1lbnQgd2lsbCBiZSBkZWZpbmVkIGJ1dCBub3QgZnVsbHlcbiAgLy8gaW5pdGlhbGl6ZWQuIFNpbmNlIHdlIGtub3cgd2UncmUgaW4gQ2hyb21lLCB3ZSdsbCBqdXN0IGRldGVjdCB0aGlzIGNhc2VcbiAgLy8gZXhwbGljaXRseVxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnByb2Nlc3MgJiYgd2luZG93LnByb2Nlc3MudHlwZSA9PT0gJ3JlbmRlcmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gSW50ZXJuZXQgRXhwbG9yZXIgYW5kIEVkZ2UgZG8gbm90IHN1cHBvcnQgY29sb3JzLlxuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goLyhlZGdlfHRyaWRlbnQpXFwvKFxcZCspLykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBpcyB3ZWJraXQ/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE2NDU5NjA2LzM3Njc3M1xuICAvLyBkb2N1bWVudCBpcyB1bmRlZmluZWQgaW4gcmVhY3QtbmF0aXZlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QtbmF0aXZlL3B1bGwvMTYzMlxuICByZXR1cm4gKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuV2Via2l0QXBwZWFyYW5jZSkgfHxcbiAgICAvLyBpcyBmaXJlYnVnPyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zOTgxMjAvMzc2NzczXG4gICAgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5jb25zb2xlICYmICh3aW5kb3cuY29uc29sZS5maXJlYnVnIHx8ICh3aW5kb3cuY29uc29sZS5leGNlcHRpb24gJiYgd2luZG93LmNvbnNvbGUudGFibGUpKSkgfHxcbiAgICAvLyBpcyBmaXJlZm94ID49IHYzMT9cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1Rvb2xzL1dlYl9Db25zb2xlI1N0eWxpbmdfbWVzc2FnZXNcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2ZpcmVmb3hcXC8oXFxkKykvKSAmJiBwYXJzZUludChSZWdFeHAuJDEsIDEwKSA+PSAzMSkgfHxcbiAgICAvLyBkb3VibGUgY2hlY2sgd2Via2l0IGluIHVzZXJBZ2VudCBqdXN0IGluIGNhc2Ugd2UgYXJlIGluIGEgd29ya2VyXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9hcHBsZXdlYmtpdFxcLyhcXGQrKS8pKTtcbn1cblxuLyoqXG4gKiBNYXAgJWogdG8gYEpTT04uc3RyaW5naWZ5KClgLCBzaW5jZSBubyBXZWIgSW5zcGVjdG9ycyBkbyB0aGF0IGJ5IGRlZmF1bHQuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzLmogPSBmdW5jdGlvbih2KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHYpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gJ1tVbmV4cGVjdGVkSlNPTlBhcnNlRXJyb3JdOiAnICsgZXJyLm1lc3NhZ2U7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBDb2xvcml6ZSBsb2cgYXJndW1lbnRzIGlmIGVuYWJsZWQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRBcmdzKGFyZ3MpIHtcbiAgdmFyIHVzZUNvbG9ycyA9IHRoaXMudXNlQ29sb3JzO1xuXG4gIGFyZ3NbMF0gPSAodXNlQ29sb3JzID8gJyVjJyA6ICcnKVxuICAgICsgdGhpcy5uYW1lc3BhY2VcbiAgICArICh1c2VDb2xvcnMgPyAnICVjJyA6ICcgJylcbiAgICArIGFyZ3NbMF1cbiAgICArICh1c2VDb2xvcnMgPyAnJWMgJyA6ICcgJylcbiAgICArICcrJyArIGV4cG9ydHMuaHVtYW5pemUodGhpcy5kaWZmKTtcblxuICBpZiAoIXVzZUNvbG9ycykgcmV0dXJuO1xuXG4gIHZhciBjID0gJ2NvbG9yOiAnICsgdGhpcy5jb2xvcjtcbiAgYXJncy5zcGxpY2UoMSwgMCwgYywgJ2NvbG9yOiBpbmhlcml0JylcblxuICAvLyB0aGUgZmluYWwgXCIlY1wiIGlzIHNvbWV3aGF0IHRyaWNreSwgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvdGhlclxuICAvLyBhcmd1bWVudHMgcGFzc2VkIGVpdGhlciBiZWZvcmUgb3IgYWZ0ZXIgdGhlICVjLCBzbyB3ZSBuZWVkIHRvXG4gIC8vIGZpZ3VyZSBvdXQgdGhlIGNvcnJlY3QgaW5kZXggdG8gaW5zZXJ0IHRoZSBDU1MgaW50b1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgbGFzdEMgPSAwO1xuICBhcmdzWzBdLnJlcGxhY2UoLyVbYS16QS1aJV0vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICBpZiAoJyUlJyA9PT0gbWF0Y2gpIHJldHVybjtcbiAgICBpbmRleCsrO1xuICAgIGlmICgnJWMnID09PSBtYXRjaCkge1xuICAgICAgLy8gd2Ugb25seSBhcmUgaW50ZXJlc3RlZCBpbiB0aGUgKmxhc3QqICVjXG4gICAgICAvLyAodGhlIHVzZXIgbWF5IGhhdmUgcHJvdmlkZWQgdGhlaXIgb3duKVxuICAgICAgbGFzdEMgPSBpbmRleDtcbiAgICB9XG4gIH0pO1xuXG4gIGFyZ3Muc3BsaWNlKGxhc3RDLCAwLCBjKTtcbn1cblxuLyoqXG4gKiBJbnZva2VzIGBjb25zb2xlLmxvZygpYCB3aGVuIGF2YWlsYWJsZS5cbiAqIE5vLW9wIHdoZW4gYGNvbnNvbGUubG9nYCBpcyBub3QgYSBcImZ1bmN0aW9uXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBsb2coKSB7XG4gIC8vIHRoaXMgaGFja2VyeSBpcyByZXF1aXJlZCBmb3IgSUU4LzksIHdoZXJlXG4gIC8vIHRoZSBgY29uc29sZS5sb2dgIGZ1bmN0aW9uIGRvZXNuJ3QgaGF2ZSAnYXBwbHknXG4gIHJldHVybiAnb2JqZWN0JyA9PT0gdHlwZW9mIGNvbnNvbGVcbiAgICAmJiBjb25zb2xlLmxvZ1xuICAgICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpO1xufVxuXG4vKipcbiAqIFNhdmUgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzYXZlKG5hbWVzcGFjZXMpIHtcbiAgdHJ5IHtcbiAgICBpZiAobnVsbCA9PSBuYW1lc3BhY2VzKSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UucmVtb3ZlSXRlbSgnZGVidWcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLmRlYnVnID0gbmFtZXNwYWNlcztcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cbn1cblxuLyoqXG4gKiBMb2FkIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHJldHVybnMgdGhlIHByZXZpb3VzbHkgcGVyc2lzdGVkIGRlYnVnIG1vZGVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2FkKCkge1xuICB2YXIgcjtcbiAgdHJ5IHtcbiAgICByID0gZXhwb3J0cy5zdG9yYWdlLmRlYnVnO1xuICB9IGNhdGNoKGUpIHt9XG5cbiAgLy8gSWYgZGVidWcgaXNuJ3Qgc2V0IGluIExTLCBhbmQgd2UncmUgaW4gRWxlY3Ryb24sIHRyeSB0byBsb2FkICRERUJVR1xuICBpZiAoIXIgJiYgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmICdlbnYnIGluIHByb2Nlc3MpIHtcbiAgICByID0gcHJvY2Vzcy5lbnYuREVCVUc7XG4gIH1cblxuICByZXR1cm4gcjtcbn1cblxuLyoqXG4gKiBFbmFibGUgbmFtZXNwYWNlcyBsaXN0ZWQgaW4gYGxvY2FsU3RvcmFnZS5kZWJ1Z2AgaW5pdGlhbGx5LlxuICovXG5cbmV4cG9ydHMuZW5hYmxlKGxvYWQoKSk7XG5cbi8qKlxuICogTG9jYWxzdG9yYWdlIGF0dGVtcHRzIHRvIHJldHVybiB0aGUgbG9jYWxzdG9yYWdlLlxuICpcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugc2FmYXJpIHRocm93c1xuICogd2hlbiBhIHVzZXIgZGlzYWJsZXMgY29va2llcy9sb2NhbHN0b3JhZ2VcbiAqIGFuZCB5b3UgYXR0ZW1wdCB0byBhY2Nlc3MgaXQuXG4gKlxuICogQHJldHVybiB7TG9jYWxTdG9yYWdlfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9jYWxzdG9yYWdlKCkge1xuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlO1xuICB9IGNhdGNoIChlKSB7fVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTlrWldKMVp5OXpjbU12WW5KdmQzTmxjaTVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEVpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpOHFLbHh1SUNvZ1ZHaHBjeUJwY3lCMGFHVWdkMlZpSUdKeWIzZHpaWElnYVcxd2JHVnRaVzUwWVhScGIyNGdiMllnWUdSbFluVm5LQ2xnTGx4dUlDcGNiaUFxSUVWNGNHOXpaU0JnWkdWaWRXY29LV0FnWVhNZ2RHaGxJRzF2WkhWc1pTNWNiaUFxTDF4dVhHNWxlSEJ2Y25SeklEMGdiVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQnlaWEYxYVhKbEtDY3VMMlJsWW5Wbkp5azdYRzVsZUhCdmNuUnpMbXh2WnlBOUlHeHZaenRjYm1WNGNHOXlkSE11Wm05eWJXRjBRWEpuY3lBOUlHWnZjbTFoZEVGeVozTTdYRzVsZUhCdmNuUnpMbk5oZG1VZ1BTQnpZWFpsTzF4dVpYaHdiM0owY3k1c2IyRmtJRDBnYkc5aFpEdGNibVY0Y0c5eWRITXVkWE5sUTI5c2IzSnpJRDBnZFhObFEyOXNiM0p6TzF4dVpYaHdiM0owY3k1emRHOXlZV2RsSUQwZ0ozVnVaR1ZtYVc1bFpDY2dJVDBnZEhsd1pXOW1JR05vY205dFpWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0ppWWdKM1Z1WkdWbWFXNWxaQ2NnSVQwZ2RIbHdaVzltSUdOb2NtOXRaUzV6ZEc5eVlXZGxYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0EvSUdOb2NtOXRaUzV6ZEc5eVlXZGxMbXh2WTJGc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQTZJR3h2WTJGc2MzUnZjbUZuWlNncE8xeHVYRzR2S2lwY2JpQXFJRU52Ykc5eWN5NWNiaUFxTDF4dVhHNWxlSEJ2Y25SekxtTnZiRzl5Y3lBOUlGdGNiaUFnSnlNd01EQXdRME1uTENBbkl6QXdNREJHUmljc0lDY2pNREF6TTBOREp5d2dKeU13TURNelJrWW5MQ0FuSXpBd05qWkRReWNzSUNjak1EQTJOa1pHSnl3Z0p5TXdNRGs1UTBNbkxGeHVJQ0FuSXpBd09UbEdSaWNzSUNjak1EQkRRekF3Snl3Z0p5TXdNRU5ETXpNbkxDQW5JekF3UTBNMk5pY3NJQ2NqTURCRFF6azVKeXdnSnlNd01FTkRRME1uTENBbkl6QXdRME5HUmljc1hHNGdJQ2NqTXpNd01FTkRKeXdnSnlNek16QXdSa1luTENBbkl6TXpNek5EUXljc0lDY2pNek16TTBaR0p5d2dKeU16TXpZMlEwTW5MQ0FuSXpNek5qWkdSaWNzSUNjak16TTVPVU5ESnl4Y2JpQWdKeU16TXprNVJrWW5MQ0FuSXpNelEwTXdNQ2NzSUNjak16TkRRek16Snl3Z0p5TXpNME5ETmpZbkxDQW5Jek16UTBNNU9TY3NJQ2NqTXpORFEwTkRKeXdnSnlNek0wTkRSa1luTEZ4dUlDQW5JelkyTURCRFF5Y3NJQ2NqTmpZd01FWkdKeXdnSnlNMk5qTXpRME1uTENBbkl6WTJNek5HUmljc0lDY2pOalpEUXpBd0p5d2dKeU0yTmtORE16TW5MQ0FuSXprNU1EQkRReWNzWEc0Z0lDY2pPVGt3TUVaR0p5d2dKeU01T1RNelEwTW5MQ0FuSXprNU16TkdSaWNzSUNjak9UbERRekF3Snl3Z0p5TTVPVU5ETXpNbkxDQW5JME5ETURBd01DY3NJQ2NqUTBNd01ETXpKeXhjYmlBZ0p5TkRRekF3TmpZbkxDQW5JME5ETURBNU9TY3NJQ2NqUTBNd01FTkRKeXdnSnlORFF6QXdSa1luTENBbkkwTkRNek13TUNjc0lDY2pRME16TXpNekp5d2dKeU5EUXpNek5qWW5MRnh1SUNBbkkwTkRNek01T1Njc0lDY2pRME16TTBOREp5d2dKeU5EUXpNelJrWW5MQ0FuSTBORE5qWXdNQ2NzSUNjalEwTTJOak16Snl3Z0p5TkRRems1TURBbkxDQW5JME5ET1Rrek15Y3NYRzRnSUNjalEwTkRRekF3Snl3Z0p5TkRRME5ETXpNbkxDQW5JMFpHTURBd01DY3NJQ2NqUmtZd01ETXpKeXdnSnlOR1JqQXdOalluTENBbkkwWkdNREE1T1Njc0lDY2pSa1l3TUVOREp5eGNiaUFnSnlOR1JqQXdSa1luTENBbkkwWkdNek13TUNjc0lDY2pSa1l6TXpNekp5d2dKeU5HUmpNek5qWW5MQ0FuSTBaR016TTVPU2NzSUNjalJrWXpNME5ESnl3Z0p5TkdSak16UmtZbkxGeHVJQ0FuSTBaR05qWXdNQ2NzSUNjalJrWTJOak16Snl3Z0p5TkdSams1TURBbkxDQW5JMFpHT1Rrek15Y3NJQ2NqUmtaRFF6QXdKeXdnSnlOR1JrTkRNek1uWEc1ZE8xeHVYRzR2S2lwY2JpQXFJRU4xY25KbGJuUnNlU0J2Ym14NUlGZGxZa3RwZEMxaVlYTmxaQ0JYWldJZ1NXNXpjR1ZqZEc5eWN5d2dSbWx5WldadmVDQStQU0IyTXpFc1hHNGdLaUJoYm1RZ2RHaGxJRVpwY21WaWRXY2daWGgwWlc1emFXOXVJQ2hoYm5rZ1JtbHlaV1p2ZUNCMlpYSnphVzl1S1NCaGNtVWdhMjV2ZDI1Y2JpQXFJSFJ2SUhOMWNIQnZjblFnWENJbFkxd2lJRU5UVXlCamRYTjBiMjFwZW1GMGFXOXVjeTVjYmlBcVhHNGdLaUJVVDBSUE9pQmhaR1FnWVNCZ2JHOWpZV3hUZEc5eVlXZGxZQ0IyWVhKcFlXSnNaU0IwYnlCbGVIQnNhV05wZEd4NUlHVnVZV0pzWlM5a2FYTmhZbXhsSUdOdmJHOXljMXh1SUNvdlhHNWNibVoxYm1OMGFXOXVJSFZ6WlVOdmJHOXljeWdwSUh0Y2JpQWdMeThnVGtJNklFbHVJR0Z1SUVWc1pXTjBjbTl1SUhCeVpXeHZZV1FnYzJOeWFYQjBMQ0JrYjJOMWJXVnVkQ0IzYVd4c0lHSmxJR1JsWm1sdVpXUWdZblYwSUc1dmRDQm1kV3hzZVZ4dUlDQXZMeUJwYm1sMGFXRnNhWHBsWkM0Z1UybHVZMlVnZDJVZ2EyNXZkeUIzWlNkeVpTQnBiaUJEYUhKdmJXVXNJSGRsSjJ4c0lHcDFjM1FnWkdWMFpXTjBJSFJvYVhNZ1kyRnpaVnh1SUNBdkx5QmxlSEJzYVdOcGRHeDVYRzRnSUdsbUlDaDBlWEJsYjJZZ2QybHVaRzkzSUNFOVBTQW5kVzVrWldacGJtVmtKeUFtSmlCM2FXNWtiM2N1Y0hKdlkyVnpjeUFtSmlCM2FXNWtiM2N1Y0hKdlkyVnpjeTUwZVhCbElEMDlQU0FuY21WdVpHVnlaWEluS1NCN1hHNGdJQ0FnY21WMGRYSnVJSFJ5ZFdVN1hHNGdJSDFjYmx4dUlDQXZMeUJKYm5SbGNtNWxkQ0JGZUhCc2IzSmxjaUJoYm1RZ1JXUm5aU0JrYnlCdWIzUWdjM1Z3Y0c5eWRDQmpiMnh2Y25NdVhHNGdJR2xtSUNoMGVYQmxiMllnYm1GMmFXZGhkRzl5SUNFOVBTQW5kVzVrWldacGJtVmtKeUFtSmlCdVlYWnBaMkYwYjNJdWRYTmxja0ZuWlc1MElDWW1JRzVoZG1sbllYUnZjaTUxYzJWeVFXZGxiblF1ZEc5TWIzZGxja05oYzJVb0tTNXRZWFJqYUNndktHVmtaMlY4ZEhKcFpHVnVkQ2xjWEM4b1hGeGtLeWt2S1NrZ2UxeHVJQ0FnSUhKbGRIVnliaUJtWVd4elpUdGNiaUFnZlZ4dVhHNGdJQzh2SUdseklIZGxZbXRwZEQ4Z2FIUjBjRG92TDNOMFlXTnJiM1psY21ac2IzY3VZMjl0TDJFdk1UWTBOVGsyTURZdk16YzJOemN6WEc0Z0lDOHZJR1J2WTNWdFpXNTBJR2x6SUhWdVpHVm1hVzVsWkNCcGJpQnlaV0ZqZEMxdVlYUnBkbVU2SUdoMGRIQnpPaTh2WjJsMGFIVmlMbU52YlM5bVlXTmxZbTl2YXk5eVpXRmpkQzF1WVhScGRtVXZjSFZzYkM4eE5qTXlYRzRnSUhKbGRIVnliaUFvZEhsd1pXOW1JR1J2WTNWdFpXNTBJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5QW1KaUJrYjJOMWJXVnVkQzVrYjJOMWJXVnVkRVZzWlcxbGJuUWdKaVlnWkc5amRXMWxiblF1Wkc5amRXMWxiblJGYkdWdFpXNTBMbk4wZVd4bElDWW1JR1J2WTNWdFpXNTBMbVJ2WTNWdFpXNTBSV3hsYldWdWRDNXpkSGxzWlM1WFpXSnJhWFJCY0hCbFlYSmhibU5sS1NCOGZGeHVJQ0FnSUM4dklHbHpJR1pwY21WaWRXYy9JR2gwZEhBNkx5OXpkR0ZqYTI5MlpYSm1iRzkzTG1OdmJTOWhMek01T0RFeU1DOHpOelkzTnpOY2JpQWdJQ0FvZEhsd1pXOW1JSGRwYm1SdmR5QWhQVDBnSjNWdVpHVm1hVzVsWkNjZ0ppWWdkMmx1Wkc5M0xtTnZibk52YkdVZ0ppWWdLSGRwYm1SdmR5NWpiMjV6YjJ4bExtWnBjbVZpZFdjZ2ZId2dLSGRwYm1SdmR5NWpiMjV6YjJ4bExtVjRZMlZ3ZEdsdmJpQW1KaUIzYVc1a2IzY3VZMjl1YzI5c1pTNTBZV0pzWlNrcEtTQjhmRnh1SUNBZ0lDOHZJR2x6SUdacGNtVm1iM2dnUGowZ2RqTXhQMXh1SUNBZ0lDOHZJR2gwZEhCek9pOHZaR1YyWld4dmNHVnlMbTF2ZW1sc2JHRXViM0puTDJWdUxWVlRMMlJ2WTNNdlZHOXZiSE12VjJWaVgwTnZibk52YkdValUzUjViR2x1WjE5dFpYTnpZV2RsYzF4dUlDQWdJQ2gwZVhCbGIyWWdibUYyYVdkaGRHOXlJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5QW1KaUJ1WVhacFoyRjBiM0l1ZFhObGNrRm5aVzUwSUNZbUlHNWhkbWxuWVhSdmNpNTFjMlZ5UVdkbGJuUXVkRzlNYjNkbGNrTmhjMlVvS1M1dFlYUmphQ2d2Wm1seVpXWnZlRnhjTHloY1hHUXJLUzhwSUNZbUlIQmhjbk5sU1c1MEtGSmxaMFY0Y0M0a01Td2dNVEFwSUQ0OUlETXhLU0I4ZkZ4dUlDQWdJQzh2SUdSdmRXSnNaU0JqYUdWamF5QjNaV0pyYVhRZ2FXNGdkWE5sY2tGblpXNTBJR3AxYzNRZ2FXNGdZMkZ6WlNCM1pTQmhjbVVnYVc0Z1lTQjNiM0pyWlhKY2JpQWdJQ0FvZEhsd1pXOW1JRzVoZG1sbllYUnZjaUFoUFQwZ0ozVnVaR1ZtYVc1bFpDY2dKaVlnYm1GMmFXZGhkRzl5TG5WelpYSkJaMlZ1ZENBbUppQnVZWFpwWjJGMGIzSXVkWE5sY2tGblpXNTBMblJ2VEc5M1pYSkRZWE5sS0NrdWJXRjBZMmdvTDJGd2NHeGxkMlZpYTJsMFhGd3ZLRnhjWkNzcEx5a3BPMXh1ZlZ4dVhHNHZLaXBjYmlBcUlFMWhjQ0FsYWlCMGJ5QmdTbE5QVGk1emRISnBibWRwWm5rb0tXQXNJSE5wYm1ObElHNXZJRmRsWWlCSmJuTndaV04wYjNKeklHUnZJSFJvWVhRZ1lua2daR1ZtWVhWc2RDNWNiaUFxTDF4dVhHNWxlSEJ2Y25SekxtWnZjbTFoZEhSbGNuTXVhaUE5SUdaMWJtTjBhVzl1S0hZcElIdGNiaUFnZEhKNUlIdGNiaUFnSUNCeVpYUjFjbTRnU2xOUFRpNXpkSEpwYm1kcFpua29kaWs3WEc0Z0lIMGdZMkYwWTJnZ0tHVnljaWtnZTF4dUlDQWdJSEpsZEhWeWJpQW5XMVZ1Wlhod1pXTjBaV1JLVTA5T1VHRnljMlZGY25KdmNsMDZJQ2NnS3lCbGNuSXViV1Z6YzJGblpUdGNiaUFnZlZ4dWZUdGNibHh1WEc0dktpcGNiaUFxSUVOdmJHOXlhWHBsSUd4dlp5QmhjbWQxYldWdWRITWdhV1lnWlc1aFlteGxaQzVjYmlBcVhHNGdLaUJBWVhCcElIQjFZbXhwWTF4dUlDb3ZYRzVjYm1aMWJtTjBhVzl1SUdadmNtMWhkRUZ5WjNNb1lYSm5jeWtnZTF4dUlDQjJZWElnZFhObFEyOXNiM0p6SUQwZ2RHaHBjeTUxYzJWRGIyeHZjbk03WEc1Y2JpQWdZWEpuYzFzd1hTQTlJQ2gxYzJWRGIyeHZjbk1nUHlBbkpXTW5JRG9nSnljcFhHNGdJQ0FnS3lCMGFHbHpMbTVoYldWemNHRmpaVnh1SUNBZ0lDc2dLSFZ6WlVOdmJHOXljeUEvSUNjZ0pXTW5JRG9nSnlBbktWeHVJQ0FnSUNzZ1lYSm5jMXN3WFZ4dUlDQWdJQ3NnS0hWelpVTnZiRzl5Y3lBL0lDY2xZeUFuSURvZ0p5QW5LVnh1SUNBZ0lDc2dKeXNuSUNzZ1pYaHdiM0owY3k1b2RXMWhibWw2WlNoMGFHbHpMbVJwWm1ZcE8xeHVYRzRnSUdsbUlDZ2hkWE5sUTI5c2IzSnpLU0J5WlhSMWNtNDdYRzVjYmlBZ2RtRnlJR01nUFNBblkyOXNiM0k2SUNjZ0t5QjBhR2x6TG1OdmJHOXlPMXh1SUNCaGNtZHpMbk53YkdsalpTZ3hMQ0F3TENCakxDQW5ZMjlzYjNJNklHbHVhR1Z5YVhRbktWeHVYRzRnSUM4dklIUm9aU0JtYVc1aGJDQmNJaVZqWENJZ2FYTWdjMjl0Wlhkb1lYUWdkSEpwWTJ0NUxDQmlaV05oZFhObElIUm9aWEpsSUdOdmRXeGtJR0psSUc5MGFHVnlYRzRnSUM4dklHRnlaM1Z0Wlc1MGN5QndZWE56WldRZ1pXbDBhR1Z5SUdKbFptOXlaU0J2Y2lCaFpuUmxjaUIwYUdVZ0pXTXNJSE52SUhkbElHNWxaV1FnZEc5Y2JpQWdMeThnWm1sbmRYSmxJRzkxZENCMGFHVWdZMjl5Y21WamRDQnBibVJsZUNCMGJ5QnBibk5sY25RZ2RHaGxJRU5UVXlCcGJuUnZYRzRnSUhaaGNpQnBibVJsZUNBOUlEQTdYRzRnSUhaaGNpQnNZWE4wUXlBOUlEQTdYRzRnSUdGeVozTmJNRjB1Y21Wd2JHRmpaU2d2SlZ0aExYcEJMVm9sWFM5bkxDQm1kVzVqZEdsdmJpaHRZWFJqYUNrZ2UxeHVJQ0FnSUdsbUlDZ25KU1VuSUQwOVBTQnRZWFJqYUNrZ2NtVjBkWEp1TzF4dUlDQWdJR2x1WkdWNEt5czdYRzRnSUNBZ2FXWWdLQ2NsWXljZ1BUMDlJRzFoZEdOb0tTQjdYRzRnSUNBZ0lDQXZMeUIzWlNCdmJteDVJR0Z5WlNCcGJuUmxjbVZ6ZEdWa0lHbHVJSFJvWlNBcWJHRnpkQ29nSldOY2JpQWdJQ0FnSUM4dklDaDBhR1VnZFhObGNpQnRZWGtnYUdGMlpTQndjbTkyYVdSbFpDQjBhR1ZwY2lCdmQyNHBYRzRnSUNBZ0lDQnNZWE4wUXlBOUlHbHVaR1Y0TzF4dUlDQWdJSDFjYmlBZ2ZTazdYRzVjYmlBZ1lYSm5jeTV6Y0d4cFkyVW9iR0Z6ZEVNc0lEQXNJR01wTzF4dWZWeHVYRzR2S2lwY2JpQXFJRWx1ZG05clpYTWdZR052Ym5OdmJHVXViRzluS0NsZ0lIZG9aVzRnWVhaaGFXeGhZbXhsTGx4dUlDb2dUbTh0YjNBZ2QyaGxiaUJnWTI5dWMyOXNaUzVzYjJkZ0lHbHpJRzV2ZENCaElGd2lablZ1WTNScGIyNWNJaTVjYmlBcVhHNGdLaUJBWVhCcElIQjFZbXhwWTF4dUlDb3ZYRzVjYm1aMWJtTjBhVzl1SUd4dlp5Z3BJSHRjYmlBZ0x5OGdkR2hwY3lCb1lXTnJaWEo1SUdseklISmxjWFZwY21Wa0lHWnZjaUJKUlRndk9Td2dkMmhsY21WY2JpQWdMeThnZEdobElHQmpiMjV6YjJ4bExteHZaMkFnWm5WdVkzUnBiMjRnWkc5bGMyNG5kQ0JvWVhabElDZGhjSEJzZVNkY2JpQWdjbVYwZFhKdUlDZHZZbXBsWTNRbklEMDlQU0IwZVhCbGIyWWdZMjl1YzI5c1pWeHVJQ0FnSUNZbUlHTnZibk52YkdVdWJHOW5YRzRnSUNBZ0ppWWdSblZ1WTNScGIyNHVjSEp2ZEc5MGVYQmxMbUZ3Y0d4NUxtTmhiR3dvWTI5dWMyOXNaUzVzYjJjc0lHTnZibk52YkdVc0lHRnlaM1Z0Wlc1MGN5azdYRzU5WEc1Y2JpOHFLbHh1SUNvZ1UyRjJaU0JnYm1GdFpYTndZV05sYzJBdVhHNGdLbHh1SUNvZ1FIQmhjbUZ0SUh0VGRISnBibWQ5SUc1aGJXVnpjR0ZqWlhOY2JpQXFJRUJoY0drZ2NISnBkbUYwWlZ4dUlDb3ZYRzVjYm1aMWJtTjBhVzl1SUhOaGRtVW9ibUZ0WlhOd1lXTmxjeWtnZTF4dUlDQjBjbmtnZTF4dUlDQWdJR2xtSUNodWRXeHNJRDA5SUc1aGJXVnpjR0ZqWlhNcElIdGNiaUFnSUNBZ0lHVjRjRzl5ZEhNdWMzUnZjbUZuWlM1eVpXMXZkbVZKZEdWdEtDZGtaV0oxWnljcE8xeHVJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0JsZUhCdmNuUnpMbk4wYjNKaFoyVXVaR1ZpZFdjZ1BTQnVZVzFsYzNCaFkyVnpPMXh1SUNBZ0lIMWNiaUFnZlNCallYUmphQ2hsS1NCN2ZWeHVmVnh1WEc0dktpcGNiaUFxSUV4dllXUWdZRzVoYldWemNHRmpaWE5nTGx4dUlDcGNiaUFxSUVCeVpYUjFjbTRnZTFOMGNtbHVaMzBnY21WMGRYSnVjeUIwYUdVZ2NISmxkbWx2ZFhOc2VTQndaWEp6YVhOMFpXUWdaR1ZpZFdjZ2JXOWtaWE5jYmlBcUlFQmhjR2tnY0hKcGRtRjBaVnh1SUNvdlhHNWNibVoxYm1OMGFXOXVJR3h2WVdRb0tTQjdYRzRnSUhaaGNpQnlPMXh1SUNCMGNua2dlMXh1SUNBZ0lISWdQU0JsZUhCdmNuUnpMbk4wYjNKaFoyVXVaR1ZpZFdjN1hHNGdJSDBnWTJGMFkyZ29aU2tnZTMxY2JseHVJQ0F2THlCSlppQmtaV0oxWnlCcGMyNG5kQ0J6WlhRZ2FXNGdURk1zSUdGdVpDQjNaU2R5WlNCcGJpQkZiR1ZqZEhKdmJpd2dkSEo1SUhSdklHeHZZV1FnSkVSRlFsVkhYRzRnSUdsbUlDZ2hjaUFtSmlCMGVYQmxiMllnY0hKdlkyVnpjeUFoUFQwZ0ozVnVaR1ZtYVc1bFpDY2dKaVlnSjJWdWRpY2dhVzRnY0hKdlkyVnpjeWtnZTF4dUlDQWdJSElnUFNCd2NtOWpaWE56TG1WdWRpNUVSVUpWUnp0Y2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCeU8xeHVmVnh1WEc0dktpcGNiaUFxSUVWdVlXSnNaU0J1WVcxbGMzQmhZMlZ6SUd4cGMzUmxaQ0JwYmlCZ2JHOWpZV3hUZEc5eVlXZGxMbVJsWW5WbllDQnBibWwwYVdGc2JIa3VYRzRnS2k5Y2JseHVaWGh3YjNKMGN5NWxibUZpYkdVb2JHOWhaQ2dwS1R0Y2JseHVMeW9xWEc0Z0tpQk1iMk5oYkhOMGIzSmhaMlVnWVhSMFpXMXdkSE1nZEc4Z2NtVjBkWEp1SUhSb1pTQnNiMk5oYkhOMGIzSmhaMlV1WEc0Z0tseHVJQ29nVkdocGN5QnBjeUJ1WldObGMzTmhjbmtnWW1WallYVnpaU0J6WVdaaGNta2dkR2h5YjNkelhHNGdLaUIzYUdWdUlHRWdkWE5sY2lCa2FYTmhZbXhsY3lCamIyOXJhV1Z6TDJ4dlkyRnNjM1J2Y21GblpWeHVJQ29nWVc1a0lIbHZkU0JoZEhSbGJYQjBJSFJ2SUdGalkyVnpjeUJwZEM1Y2JpQXFYRzRnS2lCQWNtVjBkWEp1SUh0TWIyTmhiRk4wYjNKaFoyVjlYRzRnS2lCQVlYQnBJSEJ5YVhaaGRHVmNiaUFxTDF4dVhHNW1kVzVqZEdsdmJpQnNiMk5oYkhOMGIzSmhaMlVvS1NCN1hHNGdJSFJ5ZVNCN1hHNGdJQ0FnY21WMGRYSnVJSGRwYm1SdmR5NXNiMk5oYkZOMGIzSmhaMlU3WEc0Z0lIMGdZMkYwWTJnZ0tHVXBJSHQ5WEc1OVhHNGlYWDA9IiwiXG4vKipcbiAqIFRoaXMgaXMgdGhlIGNvbW1vbiBsb2dpYyBmb3IgYm90aCB0aGUgTm9kZS5qcyBhbmQgd2ViIGJyb3dzZXJcbiAqIGltcGxlbWVudGF0aW9ucyBvZiBgZGVidWcoKWAuXG4gKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZURlYnVnLmRlYnVnID0gY3JlYXRlRGVidWdbJ2RlZmF1bHQnXSA9IGNyZWF0ZURlYnVnO1xuZXhwb3J0cy5jb2VyY2UgPSBjb2VyY2U7XG5leHBvcnRzLmRpc2FibGUgPSBkaXNhYmxlO1xuZXhwb3J0cy5lbmFibGUgPSBlbmFibGU7XG5leHBvcnRzLmVuYWJsZWQgPSBlbmFibGVkO1xuZXhwb3J0cy5odW1hbml6ZSA9IHJlcXVpcmUoJ21zJyk7XG5cbi8qKlxuICogQWN0aXZlIGBkZWJ1Z2AgaW5zdGFuY2VzLlxuICovXG5leHBvcnRzLmluc3RhbmNlcyA9IFtdO1xuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMsIGFuZCBuYW1lcyB0byBza2lwLlxuICovXG5cbmV4cG9ydHMubmFtZXMgPSBbXTtcbmV4cG9ydHMuc2tpcHMgPSBbXTtcblxuLyoqXG4gKiBNYXAgb2Ygc3BlY2lhbCBcIiVuXCIgaGFuZGxpbmcgZnVuY3Rpb25zLCBmb3IgdGhlIGRlYnVnIFwiZm9ybWF0XCIgYXJndW1lbnQuXG4gKlxuICogVmFsaWQga2V5IG5hbWVzIGFyZSBhIHNpbmdsZSwgbG93ZXIgb3IgdXBwZXItY2FzZSBsZXR0ZXIsIGkuZS4gXCJuXCIgYW5kIFwiTlwiLlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycyA9IHt9O1xuXG4vKipcbiAqIFNlbGVjdCBhIGNvbG9yLlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VsZWN0Q29sb3IobmFtZXNwYWNlKSB7XG4gIHZhciBoYXNoID0gMCwgaTtcblxuICBmb3IgKGkgaW4gbmFtZXNwYWNlKSB7XG4gICAgaGFzaCAgPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIG5hbWVzcGFjZS5jaGFyQ29kZUF0KGkpO1xuICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gIH1cblxuICByZXR1cm4gZXhwb3J0cy5jb2xvcnNbTWF0aC5hYnMoaGFzaCkgJSBleHBvcnRzLmNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lc3BhY2VgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVEZWJ1ZyhuYW1lc3BhY2UpIHtcblxuICB2YXIgcHJldlRpbWU7XG5cbiAgZnVuY3Rpb24gZGVidWcoKSB7XG4gICAgLy8gZGlzYWJsZWQ/XG4gICAgaWYgKCFkZWJ1Zy5lbmFibGVkKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IGRlYnVnO1xuXG4gICAgLy8gc2V0IGBkaWZmYCB0aW1lc3RhbXBcbiAgICB2YXIgY3VyciA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldlRpbWUgfHwgY3Vycik7XG4gICAgc2VsZi5kaWZmID0gbXM7XG4gICAgc2VsZi5wcmV2ID0gcHJldlRpbWU7XG4gICAgc2VsZi5jdXJyID0gY3VycjtcbiAgICBwcmV2VGltZSA9IGN1cnI7XG5cbiAgICAvLyB0dXJuIHRoZSBgYXJndW1lbnRzYCBpbnRvIGEgcHJvcGVyIEFycmF5XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGFyZ3NbMF0gPSBleHBvcnRzLmNvZXJjZShhcmdzWzBdKTtcblxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGFyZ3NbMF0pIHtcbiAgICAgIC8vIGFueXRoaW5nIGVsc2UgbGV0J3MgaW5zcGVjdCB3aXRoICVPXG4gICAgICBhcmdzLnVuc2hpZnQoJyVPJyk7XG4gICAgfVxuXG4gICAgLy8gYXBwbHkgYW55IGBmb3JtYXR0ZXJzYCB0cmFuc2Zvcm1hdGlvbnNcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLyUoW2EtekEtWiVdKS9nLCBmdW5jdGlvbihtYXRjaCwgZm9ybWF0KSB7XG4gICAgICAvLyBpZiB3ZSBlbmNvdW50ZXIgYW4gZXNjYXBlZCAlIHRoZW4gZG9uJ3QgaW5jcmVhc2UgdGhlIGFycmF5IGluZGV4XG4gICAgICBpZiAobWF0Y2ggPT09ICclJScpIHJldHVybiBtYXRjaDtcbiAgICAgIGluZGV4Kys7XG4gICAgICB2YXIgZm9ybWF0dGVyID0gZXhwb3J0cy5mb3JtYXR0ZXJzW2Zvcm1hdF07XG4gICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZvcm1hdHRlcikge1xuICAgICAgICB2YXIgdmFsID0gYXJnc1tpbmRleF07XG4gICAgICAgIG1hdGNoID0gZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsKTtcblxuICAgICAgICAvLyBub3cgd2UgbmVlZCB0byByZW1vdmUgYGFyZ3NbaW5kZXhdYCBzaW5jZSBpdCdzIGlubGluZWQgaW4gdGhlIGBmb3JtYXRgXG4gICAgICAgIGFyZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW5kZXgtLTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcblxuICAgIC8vIGFwcGx5IGVudi1zcGVjaWZpYyBmb3JtYXR0aW5nIChjb2xvcnMsIGV0Yy4pXG4gICAgZXhwb3J0cy5mb3JtYXRBcmdzLmNhbGwoc2VsZiwgYXJncyk7XG5cbiAgICB2YXIgbG9nRm4gPSBkZWJ1Zy5sb2cgfHwgZXhwb3J0cy5sb2cgfHwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKTtcbiAgICBsb2dGbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxuXG4gIGRlYnVnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgZGVidWcuZW5hYmxlZCA9IGV4cG9ydHMuZW5hYmxlZChuYW1lc3BhY2UpO1xuICBkZWJ1Zy51c2VDb2xvcnMgPSBleHBvcnRzLnVzZUNvbG9ycygpO1xuICBkZWJ1Zy5jb2xvciA9IHNlbGVjdENvbG9yKG5hbWVzcGFjZSk7XG4gIGRlYnVnLmRlc3Ryb3kgPSBkZXN0cm95O1xuXG4gIC8vIGVudi1zcGVjaWZpYyBpbml0aWFsaXphdGlvbiBsb2dpYyBmb3IgZGVidWcgaW5zdGFuY2VzXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZXhwb3J0cy5pbml0KSB7XG4gICAgZXhwb3J0cy5pbml0KGRlYnVnKTtcbiAgfVxuXG4gIGV4cG9ydHMuaW5zdGFuY2VzLnB1c2goZGVidWcpO1xuXG4gIHJldHVybiBkZWJ1Zztcbn1cblxuZnVuY3Rpb24gZGVzdHJveSAoKSB7XG4gIHZhciBpbmRleCA9IGV4cG9ydHMuaW5zdGFuY2VzLmluZGV4T2YodGhpcyk7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICBleHBvcnRzLmluc3RhbmNlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWVzcGFjZXMuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpIHtcbiAgZXhwb3J0cy5zYXZlKG5hbWVzcGFjZXMpO1xuXG4gIGV4cG9ydHMubmFtZXMgPSBbXTtcbiAgZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4gIHZhciBpO1xuICB2YXIgc3BsaXQgPSAodHlwZW9mIG5hbWVzcGFjZXMgPT09ICdzdHJpbmcnID8gbmFtZXNwYWNlcyA6ICcnKS5zcGxpdCgvW1xccyxdKy8pO1xuICB2YXIgbGVuID0gc3BsaXQubGVuZ3RoO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICghc3BsaXRbaV0pIGNvbnRpbnVlOyAvLyBpZ25vcmUgZW1wdHkgc3RyaW5nc1xuICAgIG5hbWVzcGFjZXMgPSBzcGxpdFtpXS5yZXBsYWNlKC9cXCovZywgJy4qPycpO1xuICAgIGlmIChuYW1lc3BhY2VzWzBdID09PSAnLScpIHtcbiAgICAgIGV4cG9ydHMuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMubmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMgKyAnJCcpKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgZXhwb3J0cy5pbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBleHBvcnRzLmluc3RhbmNlc1tpXTtcbiAgICBpbnN0YW5jZS5lbmFibGVkID0gZXhwb3J0cy5lbmFibGVkKGluc3RhbmNlLm5hbWVzcGFjZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNhYmxlIGRlYnVnIG91dHB1dC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gIGV4cG9ydHMuZW5hYmxlKCcnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGVuYWJsZWQobmFtZSkge1xuICBpZiAobmFtZVtuYW1lLmxlbmd0aCAtIDFdID09PSAnKicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgaSwgbGVuO1xuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLnNraXBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMuc2tpcHNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLm5hbWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMubmFtZXNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuIiwiLyoqXG4gKiBIZWxwZXJzLlxuICovXG5cbnZhciBzID0gMTAwMDtcbnZhciBtID0gcyAqIDYwO1xudmFyIGggPSBtICogNjA7XG52YXIgZCA9IGggKiAyNDtcbnZhciB5ID0gZCAqIDM2NS4yNTtcblxuLyoqXG4gKiBQYXJzZSBvciBmb3JtYXQgdGhlIGdpdmVuIGB2YWxgLlxuICpcbiAqIE9wdGlvbnM6XG4gKlxuICogIC0gYGxvbmdgIHZlcmJvc2UgZm9ybWF0dGluZyBbZmFsc2VdXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSB2YWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEB0aHJvd3Mge0Vycm9yfSB0aHJvdyBhbiBlcnJvciBpZiB2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIG51bWJlclxuICogQHJldHVybiB7U3RyaW5nfE51bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnICYmIHZhbC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHBhcnNlKHZhbCk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgaXNOYU4odmFsKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5sb25nID8gZm10TG9uZyh2YWwpIDogZm10U2hvcnQodmFsKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ3ZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgdmFsaWQgbnVtYmVyLiB2YWw9JyArXG4gICAgICBKU09OLnN0cmluZ2lmeSh2YWwpXG4gICk7XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBhbmQgcmV0dXJuIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgc3RyID0gU3RyaW5nKHN0cik7XG4gIGlmIChzdHIubGVuZ3RoID4gMTAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBtYXRjaCA9IC9eKCg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoXG4gICAgc3RyXG4gICk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgdmFyIHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAneWVhcnMnOlxuICAgIGNhc2UgJ3llYXInOlxuICAgIGNhc2UgJ3lycyc6XG4gICAgY2FzZSAneXInOlxuICAgIGNhc2UgJ3knOlxuICAgICAgcmV0dXJuIG4gKiB5O1xuICAgIGNhc2UgJ2RheXMnOlxuICAgIGNhc2UgJ2RheSc6XG4gICAgY2FzZSAnZCc6XG4gICAgICByZXR1cm4gbiAqIGQ7XG4gICAgY2FzZSAnaG91cnMnOlxuICAgIGNhc2UgJ2hvdXInOlxuICAgIGNhc2UgJ2hycyc6XG4gICAgY2FzZSAnaHInOlxuICAgIGNhc2UgJ2gnOlxuICAgICAgcmV0dXJuIG4gKiBoO1xuICAgIGNhc2UgJ21pbnV0ZXMnOlxuICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgY2FzZSAnbWlucyc6XG4gICAgY2FzZSAnbWluJzpcbiAgICBjYXNlICdtJzpcbiAgICAgIHJldHVybiBuICogbTtcbiAgICBjYXNlICdzZWNvbmRzJzpcbiAgICBjYXNlICdzZWNvbmQnOlxuICAgIGNhc2UgJ3NlY3MnOlxuICAgIGNhc2UgJ3NlYyc6XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gbiAqIHM7XG4gICAgY2FzZSAnbWlsbGlzZWNvbmRzJzpcbiAgICBjYXNlICdtaWxsaXNlY29uZCc6XG4gICAgY2FzZSAnbXNlY3MnOlxuICAgIGNhc2UgJ21zZWMnOlxuICAgIGNhc2UgJ21zJzpcbiAgICAgIHJldHVybiBuO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgaWYgKG1zID49IGQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO1xuICB9XG4gIGlmIChtcyA+PSBoKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztcbiAgfVxuICBpZiAobXMgPj0gbSkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSc7XG4gIH1cbiAgaWYgKG1zID49IHMpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO1xuICB9XG4gIHJldHVybiBtcyArICdtcyc7XG59XG5cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gIHJldHVybiBwbHVyYWwobXMsIGQsICdkYXknKSB8fFxuICAgIHBsdXJhbChtcywgaCwgJ2hvdXInKSB8fFxuICAgIHBsdXJhbChtcywgbSwgJ21pbnV0ZScpIHx8XG4gICAgcGx1cmFsKG1zLCBzLCAnc2Vjb25kJykgfHxcbiAgICBtcyArICcgbXMnO1xufVxuXG4vKipcbiAqIFBsdXJhbGl6YXRpb24gaGVscGVyLlxuICovXG5cbmZ1bmN0aW9uIHBsdXJhbChtcywgbiwgbmFtZSkge1xuICBpZiAobXMgPCBuKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChtcyA8IG4gKiAxLjUpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihtcyAvIG4pICsgJyAnICsgbmFtZTtcbiAgfVxuICByZXR1cm4gTWF0aC5jZWlsKG1zIC8gbikgKyAnICcgKyBuYW1lICsgJ3MnO1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuTXV0YXRpb25PYnNlcnZlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICBpZiAoY2FuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXVlTGlzdCA9IHF1ZXVlLnNsaWNlKCk7XG4gICAgICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcXVldWVMaXN0LmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGhpZGRlbkRpdiwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5EaXYuc2V0QXR0cmlidXRlKCd5ZXMnLCAnbm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsImltcG9ydCBkZWJ1Z0xvZ2dlciBmcm9tICdkZWJ1Zyc7XHJcbmNvbnN0IGRlYnVnID0gZGVidWdMb2dnZXIoJ3BoYXNlci1tb3ZlLWFuZC1zdG9wLXBsdWdpbjptb3ZlQW5kU3RvcCcpO1xyXG5jb25zdCBkZWJ1Z09iamVjdFRvTW92ZSA9IChvYmplY3RzVG9Nb3ZlLCBvYmplY3RUb01vdmUsIGxhYmVsKSA9PiBkZWJ1ZyhgJHtvYmplY3RzVG9Nb3ZlLmluZGV4T2Yob2JqZWN0VG9Nb3ZlKX06ICR7bGFiZWx9YCk7XHJcblxyXG5jb25zdCBTVEFURSA9IHtcclxuXHRpc01vdmluZzogJ2lzTW92aW5nJyxcclxuXHRoYXNTdG9wcGVkOiAnaGFzU3RvcHBlZCdcclxufTtcclxuXHJcbmZ1bmN0aW9uIGZpbmRPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgZGlzcGxheU9iamVjdCkge1xyXG5cdGlmIChkaXNwbGF5T2JqZWN0KSB7XHJcblx0XHRyZXR1cm4gb2JqZWN0c1RvTW92ZS5maW5kKG9iamVjdFRvTW92ZSA9PiBvYmplY3RUb01vdmUuZGlzcGxheU9iamVjdCA9PT0gZGlzcGxheU9iamVjdCk7XHJcblx0fVxyXG5cdHJldHVybiB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZERpc3BsYXlPYmplY3RUb0xpc3Qob2JqZWN0c1RvTW92ZSwgZGlzcGxheU9iamVjdCwgaW5mbyA9IHt9KSB7XHJcblx0Y29uc3Qgb2JqZWN0VG9Nb3ZlID0ge1xyXG5cdFx0ZGlzcGxheU9iamVjdCxcclxuXHRcdGluZm9cclxuXHR9O1xyXG5cdG9iamVjdHNUb01vdmUucHVzaChvYmplY3RUb01vdmUpO1xyXG5cdGRlYnVnT2JqZWN0VG9Nb3ZlKG9iamVjdHNUb01vdmUsIG9iamVjdFRvTW92ZSwgYGFkZERpc3BsYXlPYmplY3RUb0xpc3QgeDoke2luZm8ueH0geToke2luZm8ueX0gc3BlZWQ6JHtpbmZvLnNwZWVkfSBtYXhUaW1lOiR7aW5mby5tYXhUaW1lfSBldmVudHM6JHtpbmZvLmV2ZW50cyA/IE9iamVjdC5rZXlzKGluZm8uZXZlbnRzKSA6IGluZm8uZXZlbnRzfWApO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgb2JqZWN0VG9Nb3ZlKSB7XHJcblx0ZGVidWdPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgb2JqZWN0VG9Nb3ZlLCBcInJlbW92ZU9iamVjdFRvTW92ZVwiKTtcclxuXHRpZiAob2JqZWN0VG9Nb3ZlKSB7XHJcblx0XHRjb25zdCBpbmRleCA9IG9iamVjdHNUb01vdmUuaW5kZXhPZihvYmplY3RUb01vdmUpO1xyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0b2JqZWN0c1RvTW92ZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gc3RvcE9iamVjdE1vdmVtZW50KG9iamVjdFRvTW92ZSkge1xyXG5cdGNvbnN0IHsgZGlzcGxheU9iamVjdCwgaW5mbyB9ID0gb2JqZWN0VG9Nb3ZlO1xyXG5cdGRpc3BsYXlPYmplY3QuYm9keS52ZWxvY2l0eS54ID0gMDtcclxuXHRkaXNwbGF5T2JqZWN0LmJvZHkudmVsb2NpdHkueSA9IDA7XHJcblxyXG5cdGlmIChpbmZvLmV2ZW50cykge1xyXG5cdFx0aWYgKGluZm8uZXZlbnRzLm9uUG9zaXRpb25SZWFjaGVkKSB7XHJcblx0XHRcdGluZm8uZXZlbnRzLm9uUG9zaXRpb25SZWFjaGVkKGRpc3BsYXlPYmplY3QpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGluZm8uZXZlbnRzLm9uU3RvcHBlZCkge1xyXG5cdFx0XHRpbmZvLmV2ZW50cy5vblN0b3BwZWQoZGlzcGxheU9iamVjdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRpbmZvLm1vdmUgPSBTVEFURS5oYXNTdG9wcGVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVPYmplY3RNb3ZlbWVudChnYW1lLCBvYmplY3RUb01vdmUpIHtcclxuXHRjb25zdCB7IGRpc3BsYXlPYmplY3QsIGluZm8gfSA9IG9iamVjdFRvTW92ZTtcclxuXHRpZiAoZGlzcGxheU9iamVjdC5hbGl2ZSAmJiBpbmZvLm1vdmVEaXN0RnJvbVRhcmdldCAmJiBkaXNwbGF5T2JqZWN0LmJvZHkpIHtcclxuXHJcblx0XHRpZiAoaXNNb3Zpbmcob2JqZWN0VG9Nb3ZlKSkge1xyXG5cdFx0XHRjb25zdCB1cGRhdGVkRGlzdCA9IGdhbWUucGh5c2ljcy5hcmNhZGUuZGlzdGFuY2VUb1hZKGRpc3BsYXlPYmplY3QsIGluZm8ueCwgaW5mby55KTtcclxuXHRcdFx0aWYgKHVwZGF0ZWREaXN0ID09PSAwIHx8IHVwZGF0ZWREaXN0ID4gaW5mby5tb3ZlRGlzdEZyb21UYXJnZXQpIHtcclxuXHRcdFx0XHQvLyB1cGRhdGUgY29vcmRpbmF0ZXNcclxuXHRcdFx0XHRkaXNwbGF5T2JqZWN0LnggPSBpbmZvLng7XHJcblx0XHRcdFx0ZGlzcGxheU9iamVjdC55ID0gaW5mby55O1xyXG5cclxuXHRcdFx0XHQvLyBpZiBkaXNwbGF5T2JqZWN0IGlzIHN0aWxsIG1vdmluZywgd2UgYXNrIHRvIHBhaHNlciB0byBzdG9wIGl0IChzdG9wIHZlbG9jaXR5KVxyXG5cdFx0XHRcdHN0b3BPYmplY3RNb3ZlbWVudChvYmplY3RUb01vdmUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vaWYgbm90IHN0b3BwZWQsIG9yIG5vIG5lZWQgdG8gc3RvcCwgd2UgdXBkYXRlIGxhc3QgZGlzdGFuY2UgYmV0d2VlbiBjdXJyZW50IGRpc3BsYXlPYmplY3QgYW5kIHRhcmdldHRlZCBjb3JyZGluYXRlc1xyXG5cdFx0XHRcdGluZm8ubW92ZURpc3RGcm9tVGFyZ2V0ID0gdXBkYXRlZERpc3Q7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzTW92aW5nKG9iamVjdFRvTW92ZSkge1xyXG5cdGNvbnN0IHsgaW5mbyB9ID0gb2JqZWN0VG9Nb3ZlO1xyXG5cdHJldHVybiBpbmZvLm1vdmUgPT09IFNUQVRFLmlzTW92aW5nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYXNTdG9wcGVkKG9iamVjdFRvTW92ZSkge1xyXG5cdGNvbnN0IHsgaW5mbyB9ID0gb2JqZWN0VG9Nb3ZlO1xyXG5cdHJldHVybiBpbmZvLm1vdmUgPT09IFNUQVRFLmhhc1N0b3BwZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwb3N0VXBkYXRlKG9iamVjdHNUb01vdmUsIGdhbWUpIHtcclxuXHRjb25zdCBvYmplY3RzTm90QWxpdmUgPSBbXTtcclxuXHRvYmplY3RzVG9Nb3ZlLmZvckVhY2gob2JqZWN0VG9Nb3ZlID0+IHtcclxuXHRcdGNvbnN0IHsgZGlzcGxheU9iamVjdCwgaW5mbyB9ID0gb2JqZWN0VG9Nb3ZlO1xyXG5cdFx0aWYgKCFkaXNwbGF5T2JqZWN0IHx8ICFkaXNwbGF5T2JqZWN0LmFsaXZlIHx8IGhhc1N0b3BwZWQob2JqZWN0VG9Nb3ZlKSkge1xyXG5cdFx0XHRpZiAoaW5mbyAmJiBpbmZvLmV2ZW50cykge1xyXG5cdFx0XHRcdGlmIChpbmZvLmV2ZW50cy5vblN0b3BwZWQpIHtcclxuXHRcdFx0XHRcdGluZm8uZXZlbnRzLm9uU3RvcHBlZChkaXNwbGF5T2JqZWN0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0b2JqZWN0c05vdEFsaXZlLnB1c2gob2JqZWN0VG9Nb3ZlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHVwZGF0ZU9iamVjdE1vdmVtZW50KGdhbWUsIG9iamVjdFRvTW92ZSk7XHJcblx0XHRcdGlmIChoYXNTdG9wcGVkKG9iamVjdFRvTW92ZSkpIHtcclxuXHRcdFx0XHRvYmplY3RzTm90QWxpdmUucHVzaChvYmplY3RUb01vdmUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdG9iamVjdHNOb3RBbGl2ZS5mb3JFYWNoKG9iamVjdFRvTW92ZSA9PiB7XHJcblx0XHRyZW1vdmVPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgb2JqZWN0VG9Nb3ZlKTtcclxuXHR9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbU1vdmluZyhkaXNwbGF5T2JqZWN0KSB7XHJcblx0aWYgKCFkaXNwbGF5T2JqZWN0KSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaXMgdW5kZWZpbmVkXCIpO1xyXG5cdH1cclxuXHRyZXR1cm4gZGlzcGxheU9iamVjdC5ib2R5XHJcblx0XHQmJiBkaXNwbGF5T2JqZWN0LmJvZHkudmVsb2NpdHlcclxuXHRcdCYmIChkaXNwbGF5T2JqZWN0LmJvZHkudmVsb2NpdHkueCB8fCBkaXNwbGF5T2JqZWN0LmJvZHkudmVsb2NpdHkueSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtb3ZlVG9YWShvYmplY3RzVG9Nb3ZlLCBnYW1lLCBkaXNwbGF5T2JqZWN0LCB4LCB5LCBzcGVlZCwgbWF4VGltZSwgZXZlbnRzKSB7XHJcblx0aWYgKGRpc3BsYXlPYmplY3QgJiYgZGlzcGxheU9iamVjdC5hbGl2ZSAmJiBkaXNwbGF5T2JqZWN0LmJvZHkpIHtcclxuXHRcdGNvbnN0IG9iamVjdFRvTW92ZSA9IGZpbmRPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgZGlzcGxheU9iamVjdCk7XHJcblxyXG5cdFx0aWYgKCFvYmplY3RUb01vdmUgfHwgKFxyXG5cdFx0XHRvYmplY3RUb01vdmUuaW5mby54ICE9PSB4IHx8XHJcblx0XHRcdG9iamVjdFRvTW92ZS5pbmZvLnkgIT09IHkgfHxcclxuXHRcdFx0b2JqZWN0VG9Nb3ZlLmluZm8uc3BlZWQgIT09IHNwZWVkIHx8XHJcblx0XHRcdG9iamVjdFRvTW92ZS5pbmZvLm1heFRpbWUgIT09IG1heFRpbWUgfHxcclxuXHRcdFx0b2JqZWN0VG9Nb3ZlLmluZm8uZXZlbnRzICE9PSBldmVudHNcclxuXHRcdCkpIHtcclxuXHRcdFx0aWYgKG9iamVjdFRvTW92ZSkge1xyXG5cdFx0XHRcdHJlbW92ZU9iamVjdFRvTW92ZShvYmplY3RzVG9Nb3ZlLCBvYmplY3RUb01vdmUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNvbnN0IG1vdmVEaXN0RnJvbVRhcmdldCA9IGdhbWUucGh5c2ljcy5hcmNhZGUuZGlzdGFuY2VUb1hZKGRpc3BsYXlPYmplY3QsIHgsIHkpO1xyXG5cdFx0XHRhZGREaXNwbGF5T2JqZWN0VG9MaXN0KG9iamVjdHNUb01vdmUsIGRpc3BsYXlPYmplY3QsIHtcclxuXHRcdFx0XHRtb3ZlOiBTVEFURS5pc01vdmluZyxcclxuXHRcdFx0XHR4LFxyXG5cdFx0XHRcdHksXHJcblx0XHRcdFx0c3BlZWQsXHJcblx0XHRcdFx0bWF4VGltZSxcclxuXHRcdFx0XHRldmVudHMsXHJcblx0XHRcdFx0bW92ZURpc3RGcm9tVGFyZ2V0LFxyXG5cdFx0XHRcdG1vdmVEaXN0RnJvbVRhcmdldE9yaWdpbjogbW92ZURpc3RGcm9tVGFyZ2V0XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gZ2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9YWShkaXNwbGF5T2JqZWN0LCB4LCB5LCBzcGVlZCwgbWF4VGltZSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbW92ZVRvT2JqZWN0KG9iamVjdHNUb01vdmUsIGdhbWUsIGRpc3BsYXlPYmplY3QsIGRlc3RpbmF0aW9uLCBzcGVlZCwgbWF4VGltZSwgZXZlbnRzKSB7XHJcblx0cmV0dXJuIG1vdmVUb1hZKG9iamVjdHNUb01vdmUsIGdhbWUsIGRpc3BsYXlPYmplY3QsIGRlc3RpbmF0aW9uLngsIGRlc3RpbmF0aW9uLnksIHNwZWVkLCBtYXhUaW1lLCBldmVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RvcFRvTW92ZShvYmplY3RzVG9Nb3ZlLCBkaXNwbGF5T2JqZWN0KSB7XHJcblx0Y29uc3Qgb2JqZWN0VG9Nb3ZlID0gZmluZE9iamVjdFRvTW92ZShvYmplY3RzVG9Nb3ZlLCBkaXNwbGF5T2JqZWN0KTtcclxuXHRpZiAob2JqZWN0VG9Nb3ZlKSB7XHJcblx0XHRpZiAoaXNNb3Zpbmcob2JqZWN0VG9Nb3ZlKSkge1xyXG5cdFx0XHRzdG9wT2JqZWN0TW92ZW1lbnQob2JqZWN0VG9Nb3ZlKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuIl19
