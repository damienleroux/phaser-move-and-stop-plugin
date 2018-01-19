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
			game.physics.arcade.moveToXY(displayObject, x, y, speed, maxTime);
		}
	}
}

function moveToObject(objectsToMove, game, displayObject, destination, speed, maxTime, events) {
	moveToXY(objectsToMove, game, displayObject, destination.x, destination.y, speed, maxTime, events);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1VzZXJzL2RhbWllbi9Eb2N1bWVudHMvd29ya3NwYWNlL3BoYXNlci1tb3ZlLWFuZC1zdG9wLXBsdWdpbi9zcmMvbW92ZS1hbmQtc3RvcC1wbHVnaW4uanMiLCJub2RlX21vZHVsZXNcXGRlYnVnXFxzcmNcXGJyb3dzZXIuanMiLCJub2RlX21vZHVsZXNcXGRlYnVnXFxzcmNcXGRlYnVnLmpzIiwibm9kZV9tb2R1bGVzXFxtc1xcaW5kZXguanMiLCJub2RlX21vZHVsZXNcXHByb2Nlc3NcXGJyb3dzZXIuanMiLCJDOi9Vc2Vycy9kYW1pZW4vRG9jdW1lbnRzL3dvcmtzcGFjZS9waGFzZXItbW92ZS1hbmQtc3RvcC1wbHVnaW4vc3JjL21vdmUtYW5kLXN0b3AtY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OytCQ01PLHNCQUFzQjs7SUFMNUIsVUFBVSxvQkFBVixVQUFVO0lBQ1YsWUFBWSxvQkFBWixZQUFZO0lBQ1osUUFBUSxvQkFBUixRQUFRO0lBQ1IsWUFBWSxvQkFBWixZQUFZO0lBQ1osVUFBVSxvQkFBVixVQUFVOzs7O0FBS1gsU0FBUyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUNsQyxPQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZDLEtBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLEtBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0NBQ25COztBQUVELFdBQVcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUvRCxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLFdBQVcsR0FBRztBQUN6RCxRQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNqRCxDQUFDOzs7O0FBSUYsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDdkYsUUFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDNUYsQ0FBQzs7QUFFRixXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLFFBQVEsQ0FBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQ3RHLFFBQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDdkcsQ0FBQzs7QUFFRixXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDekQsUUFBTyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztDQUNyRCxDQUFDOzs7O0FBSUYsV0FBVyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBQyxhQUFhLEVBQUs7QUFDdkQsUUFBTyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7Q0FDbkMsQ0FBQzs7aUJBRWEsV0FBVzs7O0FDMUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7UUNKZ0IsVUFBVSxHQUFWLFVBQVU7UUF3QlYsWUFBWSxHQUFaLFlBQVk7UUFTWixRQUFRLEdBQVIsUUFBUTtRQThCUixZQUFZLEdBQVosWUFBWTtRQUlaLFVBQVUsR0FBVixVQUFVOzs7OztJQXJKbkIsV0FBVywyQkFBTSxPQUFPOztBQUMvQixJQUFNLEtBQUssR0FBRyxXQUFXLENBQUMseUNBQXlDLENBQUMsQ0FBQztBQUNyRSxJQUFNLGlCQUFpQixHQUFHLFVBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxLQUFLO1FBQUssS0FBSyxNQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQUssS0FBSyxDQUFHO0NBQUEsQ0FBQzs7QUFFNUgsSUFBTSxLQUFLLEdBQUc7QUFDYixTQUFRLEVBQUUsVUFBVTtBQUNwQixXQUFVLEVBQUUsWUFBWTtDQUN4QixDQUFDOztBQUVGLFNBQVMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRTtBQUN2RCxLQUFJLGFBQWEsRUFBRTtBQUNsQixTQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBQSxZQUFZO1VBQUksWUFBWSxDQUFDLGFBQWEsS0FBSyxhQUFhO0dBQUEsQ0FBQyxDQUFDO0VBQ3hGO0FBQ0QsUUFBTyxTQUFTLENBQUM7Q0FDakI7O0FBRUQsU0FBUyxzQkFBc0IsQ0FBQyxhQUFhLEVBQUUsYUFBYSxFQUFhO0tBQVgsSUFBSSxnQ0FBRyxFQUFFOztBQUN0RSxLQUFNLFlBQVksR0FBRztBQUNwQixlQUFhLEVBQWIsYUFBYTtBQUNiLE1BQUksRUFBSixJQUFJO0VBQ0osQ0FBQztBQUNGLGNBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDakMsa0JBQWlCLENBQUMsYUFBYSxFQUFFLFlBQVksZ0NBQThCLElBQUksQ0FBQyxDQUFDLFdBQU0sSUFBSSxDQUFDLENBQUMsZUFBVSxJQUFJLENBQUMsS0FBSyxpQkFBWSxJQUFJLENBQUMsT0FBTyxpQkFBVyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUEsQ0FBRyxDQUFDO0NBQzVNOztBQUVELFNBQVMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRTtBQUN4RCxrQkFBaUIsQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDckUsS0FBSSxZQUFZLEVBQUU7QUFDakIsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNsRCxNQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNmLGdCQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztHQUMvQjtFQUNEO0NBQ0Q7O0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUU7S0FDakMsYUFBYSxHQUFXLFlBQVksQ0FBcEMsYUFBYTtLQUFFLElBQUksR0FBSyxZQUFZLENBQXJCLElBQUk7O0FBQzNCLGNBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsY0FBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFbEMsS0FBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2hCLE1BQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRTtBQUNsQyxPQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0dBQzdDO0FBQ0QsTUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtBQUMxQixPQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztHQUNyQztFQUNEOztBQUVELEtBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztDQUM3Qjs7QUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7S0FDekMsYUFBYSxHQUFXLFlBQVksQ0FBcEMsYUFBYTtLQUFFLElBQUksR0FBSyxZQUFZLENBQXJCLElBQUk7O0FBQzNCLEtBQUksYUFBYSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksYUFBYSxDQUFDLElBQUksRUFBRTs7QUFFekUsTUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFDM0IsT0FBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRixPQUFJLFdBQVcsS0FBSyxDQUFDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRTs7QUFFL0Qsc0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRWpDLGlCQUFhLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDekIsaUJBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN6QixNQUFNOztBQUVOLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxXQUFXLENBQUM7SUFDdEM7R0FDRDtFQUNEO0NBQ0Q7O0FBRUQsU0FBUyxRQUFRLENBQUMsWUFBWSxFQUFFO0tBQ3ZCLElBQUksR0FBSyxZQUFZLENBQXJCLElBQUk7O0FBQ1osUUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxRQUFRLENBQUM7Q0FDcEM7O0FBRUQsU0FBUyxVQUFVLENBQUMsWUFBWSxFQUFFO0tBQ3pCLElBQUksR0FBSyxZQUFZLENBQXJCLElBQUk7O0FBQ1osUUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxVQUFVLENBQUM7Q0FDdEM7O0FBRU0sU0FBUyxVQUFVLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRTtBQUMvQyxLQUFNLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDM0IsY0FBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFlBQVksRUFBSTtNQUM3QixhQUFhLEdBQVcsWUFBWSxDQUFwQyxhQUFhO01BQUUsSUFBSSxHQUFLLFlBQVksQ0FBckIsSUFBSTs7QUFDM0IsTUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQ3ZFLE9BQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDeEIsUUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtBQUMxQixTQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNyQztJQUNEO0FBQ0Qsa0JBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDbkMsTUFBTTtBQUNOLHVCQUFvQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN6QyxPQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUM3QixtQkFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNuQztHQUNEO0VBQ0QsQ0FBQyxDQUFDOztBQUVILGdCQUFlLENBQUMsT0FBTyxDQUFDLFVBQUEsWUFBWSxFQUFJO0FBQ3ZDLG9CQUFrQixDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztFQUNoRCxDQUFDLENBQUM7Q0FDSDs7QUFFTSxTQUFTLFlBQVksQ0FBQyxhQUFhLEVBQUU7QUFDM0MsS0FBSSxDQUFDLGFBQWEsRUFBRTtBQUNuQixRQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7RUFDdkM7QUFDRCxRQUFPLGFBQWEsQ0FBQyxJQUFJLElBQ3JCLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUMxQixhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQztDQUNyRTs7QUFFTSxTQUFTLFFBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzFGLEtBQUksYUFBYSxJQUFJLGFBQWEsQ0FBQyxLQUFLLElBQUksYUFBYSxDQUFDLElBQUksRUFBRTtBQUMvRCxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7O0FBRXBFLE1BQUksQ0FBQyxZQUFZLEtBQ2hCLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFDekIsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUN6QixZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLElBQ2pDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLE9BQU8sSUFDckMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFBLEFBQ25DLEVBQUU7QUFDRixPQUFJLFlBQVksRUFBRTtBQUNqQixzQkFBa0IsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDaEQ7QUFDRCxPQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLHlCQUFzQixDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUU7QUFDcEQsUUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRO0FBQ3BCLEtBQUMsRUFBRCxDQUFDO0FBQ0QsS0FBQyxFQUFELENBQUM7QUFDRCxTQUFLLEVBQUwsS0FBSztBQUNMLFdBQU8sRUFBUCxPQUFPO0FBQ1AsVUFBTSxFQUFOLE1BQU07QUFDTixzQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLDRCQUF3QixFQUFFLGtCQUFrQjtJQUM1QyxDQUFDLENBQUM7QUFDSCxPQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ2xFO0VBQ0Q7Q0FDRDs7QUFFTSxTQUFTLFlBQVksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDckcsU0FBUSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQ25HOztBQUVNLFNBQVMsVUFBVSxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUU7QUFDeEQsS0FBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3BFLEtBQUksWUFBWSxFQUFFO0FBQ2pCLE1BQUksUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQzNCLHFCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQ2pDO0VBQ0Q7Q0FDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge1xyXG5cdHBvc3RVcGRhdGUsXHJcblx0aXNJdGVtTW92aW5nLFxyXG5cdG1vdmVUb1hZLFxyXG5cdG1vdmVUb09iamVjdCxcclxuXHRzdG9wVG9Nb3ZlXHJcbn0gZnJvbSAnLi9tb3ZlLWFuZC1zdG9wLWNvcmUnO1xyXG5cclxuLy9QbHVnaW4gQ29yZSBkZWZpbml0aW9uXHJcblxyXG5mdW5jdGlvbiBNb3ZlQW5kU3RvcChnYW1lLCBwYXJlbnQpIHtcclxuXHRQaGFzZXIuUGx1Z2luLmNhbGwodGhpcywgZ2FtZSwgcGFyZW50KTtcclxuXHR0aGlzLm9iamVjdHNUb01vdmUgPSBbXTtcclxuXHR0aGlzLmFjdGl2ZSA9IHRydWU7IC8vZW5hYmxlIHJlVXBkYXRlIGFuZCB1cGRhdGUgbWV0aG9kcyBjYWxsZWQgYnkgdGhlIHBhcmVudFxyXG59XHJcblxyXG5Nb3ZlQW5kU3RvcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBoYXNlci5QbHVnaW4ucHJvdG90eXBlKTtcclxuXHJcbk1vdmVBbmRTdG9wLnByb3RvdHlwZS5wb3N0VXBkYXRlID0gZnVuY3Rpb24gcG9zdFVwZGF0ZV8oKSB7XHJcblx0cmV0dXJuIHBvc3RVcGRhdGUodGhpcy5vYmplY3RzVG9Nb3ZlLCB0aGlzLmdhbWUpO1xyXG59O1xyXG5cclxuLy9QbHVnaW4gbW92aW5nIGZ1bmN0aW9uc1xyXG5cclxuTW92ZUFuZFN0b3AucHJvdG90eXBlLnRvWFkgPSBmdW5jdGlvbiB0b1hZKGRpc3BsYXlPYmplY3QsIHgsIHksIHNwZWVkLCBtYXhUaW1lLCBldmVudHMpIHtcclxuXHRyZXR1cm4gbW92ZVRvWFkodGhpcy5vYmplY3RzVG9Nb3ZlLCB0aGlzLmdhbWUsIGRpc3BsYXlPYmplY3QsIHgsIHksIHNwZWVkLCBtYXhUaW1lLCBldmVudHMpO1xyXG59O1xyXG5cclxuTW92ZUFuZFN0b3AucHJvdG90eXBlLnRvT2JqZWN0ID0gZnVuY3Rpb24gdG9PYmplY3QoZGlzcGxheU9iamVjdCwgZGVzdGluYXRpb24sIHNwZWVkLCBtYXhUaW1lLCBldmVudHMpIHtcclxuXHRyZXR1cm4gbW92ZVRvT2JqZWN0KHRoaXMub2JqZWN0c1RvTW92ZSwgdGhpcy5nYW1lLCBkaXNwbGF5T2JqZWN0LCBkZXN0aW5hdGlvbiwgc3BlZWQsIG1heFRpbWUsIGV2ZW50cyk7XHJcbn07XHJcblxyXG5Nb3ZlQW5kU3RvcC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uIHN0b3AoZGlzcGxheU9iamVjdCkge1xyXG5cdHJldHVybiBzdG9wVG9Nb3ZlKHRoaXMub2JqZWN0c1RvTW92ZSwgZGlzcGxheU9iamVjdCk7XHJcbn07XHJcblxyXG4vLyBVdGlsc1xyXG5cclxuTW92ZUFuZFN0b3AucHJvdG90eXBlLmlzSXRlbU1vdmluZyA9IChkaXNwbGF5T2JqZWN0KSA9PiB7XHJcblx0cmV0dXJuIGlzSXRlbU1vdmluZyhkaXNwbGF5T2JqZWN0KTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vdmVBbmRTdG9wO1xyXG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuLyoqXG4gKiBUaGlzIGlzIHRoZSB3ZWIgYnJvd3NlciBpbXBsZW1lbnRhdGlvbiBvZiBgZGVidWcoKWAuXG4gKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGVidWcnKTtcbmV4cG9ydHMubG9nID0gbG9nO1xuZXhwb3J0cy5mb3JtYXRBcmdzID0gZm9ybWF0QXJncztcbmV4cG9ydHMuc2F2ZSA9IHNhdmU7XG5leHBvcnRzLmxvYWQgPSBsb2FkO1xuZXhwb3J0cy51c2VDb2xvcnMgPSB1c2VDb2xvcnM7XG5leHBvcnRzLnN0b3JhZ2UgPSAndW5kZWZpbmVkJyAhPSB0eXBlb2YgY2hyb21lXG4gICAgICAgICAgICAgICAmJiAndW5kZWZpbmVkJyAhPSB0eXBlb2YgY2hyb21lLnN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgID8gY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgICAgICAgICAgICAgICAgIDogbG9jYWxzdG9yYWdlKCk7XG5cbi8qKlxuICogQ29sb3JzLlxuICovXG5cbmV4cG9ydHMuY29sb3JzID0gW1xuICAnIzAwMDBDQycsICcjMDAwMEZGJywgJyMwMDMzQ0MnLCAnIzAwMzNGRicsICcjMDA2NkNDJywgJyMwMDY2RkYnLCAnIzAwOTlDQycsXG4gICcjMDA5OUZGJywgJyMwMENDMDAnLCAnIzAwQ0MzMycsICcjMDBDQzY2JywgJyMwMENDOTknLCAnIzAwQ0NDQycsICcjMDBDQ0ZGJyxcbiAgJyMzMzAwQ0MnLCAnIzMzMDBGRicsICcjMzMzM0NDJywgJyMzMzMzRkYnLCAnIzMzNjZDQycsICcjMzM2NkZGJywgJyMzMzk5Q0MnLFxuICAnIzMzOTlGRicsICcjMzNDQzAwJywgJyMzM0NDMzMnLCAnIzMzQ0M2NicsICcjMzNDQzk5JywgJyMzM0NDQ0MnLCAnIzMzQ0NGRicsXG4gICcjNjYwMENDJywgJyM2NjAwRkYnLCAnIzY2MzNDQycsICcjNjYzM0ZGJywgJyM2NkNDMDAnLCAnIzY2Q0MzMycsICcjOTkwMENDJyxcbiAgJyM5OTAwRkYnLCAnIzk5MzNDQycsICcjOTkzM0ZGJywgJyM5OUNDMDAnLCAnIzk5Q0MzMycsICcjQ0MwMDAwJywgJyNDQzAwMzMnLFxuICAnI0NDMDA2NicsICcjQ0MwMDk5JywgJyNDQzAwQ0MnLCAnI0NDMDBGRicsICcjQ0MzMzAwJywgJyNDQzMzMzMnLCAnI0NDMzM2NicsXG4gICcjQ0MzMzk5JywgJyNDQzMzQ0MnLCAnI0NDMzNGRicsICcjQ0M2NjAwJywgJyNDQzY2MzMnLCAnI0NDOTkwMCcsICcjQ0M5OTMzJyxcbiAgJyNDQ0NDMDAnLCAnI0NDQ0MzMycsICcjRkYwMDAwJywgJyNGRjAwMzMnLCAnI0ZGMDA2NicsICcjRkYwMDk5JywgJyNGRjAwQ0MnLFxuICAnI0ZGMDBGRicsICcjRkYzMzAwJywgJyNGRjMzMzMnLCAnI0ZGMzM2NicsICcjRkYzMzk5JywgJyNGRjMzQ0MnLCAnI0ZGMzNGRicsXG4gICcjRkY2NjAwJywgJyNGRjY2MzMnLCAnI0ZGOTkwMCcsICcjRkY5OTMzJywgJyNGRkNDMDAnLCAnI0ZGQ0MzMydcbl07XG5cbi8qKlxuICogQ3VycmVudGx5IG9ubHkgV2ViS2l0LWJhc2VkIFdlYiBJbnNwZWN0b3JzLCBGaXJlZm94ID49IHYzMSxcbiAqIGFuZCB0aGUgRmlyZWJ1ZyBleHRlbnNpb24gKGFueSBGaXJlZm94IHZlcnNpb24pIGFyZSBrbm93blxuICogdG8gc3VwcG9ydCBcIiVjXCIgQ1NTIGN1c3RvbWl6YXRpb25zLlxuICpcbiAqIFRPRE86IGFkZCBhIGBsb2NhbFN0b3JhZ2VgIHZhcmlhYmxlIHRvIGV4cGxpY2l0bHkgZW5hYmxlL2Rpc2FibGUgY29sb3JzXG4gKi9cblxuZnVuY3Rpb24gdXNlQ29sb3JzKCkge1xuICAvLyBOQjogSW4gYW4gRWxlY3Ryb24gcHJlbG9hZCBzY3JpcHQsIGRvY3VtZW50IHdpbGwgYmUgZGVmaW5lZCBidXQgbm90IGZ1bGx5XG4gIC8vIGluaXRpYWxpemVkLiBTaW5jZSB3ZSBrbm93IHdlJ3JlIGluIENocm9tZSwgd2UnbGwganVzdCBkZXRlY3QgdGhpcyBjYXNlXG4gIC8vIGV4cGxpY2l0bHlcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wcm9jZXNzICYmIHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEludGVybmV0IEV4cGxvcmVyIGFuZCBFZGdlIGRvIG5vdCBzdXBwb3J0IGNvbG9ycy5cbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC8oZWRnZXx0cmlkZW50KVxcLyhcXGQrKS8pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gaXMgd2Via2l0PyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNjQ1OTYwNi8zNzY3NzNcbiAgLy8gZG9jdW1lbnQgaXMgdW5kZWZpbmVkIGluIHJlYWN0LW5hdGl2ZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0LW5hdGl2ZS9wdWxsLzE2MzJcbiAgcmV0dXJuICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLldlYmtpdEFwcGVhcmFuY2UpIHx8XG4gICAgLy8gaXMgZmlyZWJ1Zz8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzk4MTIwLzM3Njc3M1xuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY29uc29sZSAmJiAod2luZG93LmNvbnNvbGUuZmlyZWJ1ZyB8fCAod2luZG93LmNvbnNvbGUuZXhjZXB0aW9uICYmIHdpbmRvdy5jb25zb2xlLnRhYmxlKSkpIHx8XG4gICAgLy8gaXMgZmlyZWZveCA+PSB2MzE/XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Ub29scy9XZWJfQ29uc29sZSNTdHlsaW5nX21lc3NhZ2VzXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9maXJlZm94XFwvKFxcZCspLykgJiYgcGFyc2VJbnQoUmVnRXhwLiQxLCAxMCkgPj0gMzEpIHx8XG4gICAgLy8gZG91YmxlIGNoZWNrIHdlYmtpdCBpbiB1c2VyQWdlbnQganVzdCBpbiBjYXNlIHdlIGFyZSBpbiBhIHdvcmtlclxuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvYXBwbGV3ZWJraXRcXC8oXFxkKykvKSk7XG59XG5cbi8qKlxuICogTWFwICVqIHRvIGBKU09OLnN0cmluZ2lmeSgpYCwgc2luY2Ugbm8gV2ViIEluc3BlY3RvcnMgZG8gdGhhdCBieSBkZWZhdWx0LlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycy5qID0gZnVuY3Rpb24odikge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuICdbVW5leHBlY3RlZEpTT05QYXJzZUVycm9yXTogJyArIGVyci5tZXNzYWdlO1xuICB9XG59O1xuXG5cbi8qKlxuICogQ29sb3JpemUgbG9nIGFyZ3VtZW50cyBpZiBlbmFibGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0QXJncyhhcmdzKSB7XG4gIHZhciB1c2VDb2xvcnMgPSB0aGlzLnVzZUNvbG9ycztcblxuICBhcmdzWzBdID0gKHVzZUNvbG9ycyA/ICclYycgOiAnJylcbiAgICArIHRoaXMubmFtZXNwYWNlXG4gICAgKyAodXNlQ29sb3JzID8gJyAlYycgOiAnICcpXG4gICAgKyBhcmdzWzBdXG4gICAgKyAodXNlQ29sb3JzID8gJyVjICcgOiAnICcpXG4gICAgKyAnKycgKyBleHBvcnRzLmh1bWFuaXplKHRoaXMuZGlmZik7XG5cbiAgaWYgKCF1c2VDb2xvcnMpIHJldHVybjtcblxuICB2YXIgYyA9ICdjb2xvcjogJyArIHRoaXMuY29sb3I7XG4gIGFyZ3Muc3BsaWNlKDEsIDAsIGMsICdjb2xvcjogaW5oZXJpdCcpXG5cbiAgLy8gdGhlIGZpbmFsIFwiJWNcIiBpcyBzb21ld2hhdCB0cmlja3ksIGJlY2F1c2UgdGhlcmUgY291bGQgYmUgb3RoZXJcbiAgLy8gYXJndW1lbnRzIHBhc3NlZCBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSAlYywgc28gd2UgbmVlZCB0b1xuICAvLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IGluZGV4IHRvIGluc2VydCB0aGUgQ1NTIGludG9cbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGxhc3RDID0gMDtcbiAgYXJnc1swXS5yZXBsYWNlKC8lW2EtekEtWiVdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgaWYgKCclJScgPT09IG1hdGNoKSByZXR1cm47XG4gICAgaW5kZXgrKztcbiAgICBpZiAoJyVjJyA9PT0gbWF0Y2gpIHtcbiAgICAgIC8vIHdlIG9ubHkgYXJlIGludGVyZXN0ZWQgaW4gdGhlICpsYXN0KiAlY1xuICAgICAgLy8gKHRoZSB1c2VyIG1heSBoYXZlIHByb3ZpZGVkIHRoZWlyIG93bilcbiAgICAgIGxhc3RDID0gaW5kZXg7XG4gICAgfVxuICB9KTtcblxuICBhcmdzLnNwbGljZShsYXN0QywgMCwgYyk7XG59XG5cbi8qKlxuICogSW52b2tlcyBgY29uc29sZS5sb2coKWAgd2hlbiBhdmFpbGFibGUuXG4gKiBOby1vcCB3aGVuIGBjb25zb2xlLmxvZ2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbG9nKCkge1xuICAvLyB0aGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOC85LCB3aGVyZVxuICAvLyB0aGUgYGNvbnNvbGUubG9nYCBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICByZXR1cm4gJ29iamVjdCcgPT09IHR5cGVvZiBjb25zb2xlXG4gICAgJiYgY29uc29sZS5sb2dcbiAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBTYXZlIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2F2ZShuYW1lc3BhY2VzKSB7XG4gIHRyeSB7XG4gICAgaWYgKG51bGwgPT0gbmFtZXNwYWNlcykge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZyA9IG5hbWVzcGFjZXM7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG59XG5cbi8qKlxuICogTG9hZCBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSByZXR1cm5zIHRoZSBwcmV2aW91c2x5IHBlcnNpc3RlZCBkZWJ1ZyBtb2Rlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9hZCgpIHtcbiAgdmFyIHI7XG4gIHRyeSB7XG4gICAgciA9IGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZztcbiAgfSBjYXRjaChlKSB7fVxuXG4gIC8vIElmIGRlYnVnIGlzbid0IHNldCBpbiBMUywgYW5kIHdlJ3JlIGluIEVsZWN0cm9uLCB0cnkgdG8gbG9hZCAkREVCVUdcbiAgaWYgKCFyICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiAnZW52JyBpbiBwcm9jZXNzKSB7XG4gICAgciA9IHByb2Nlc3MuZW52LkRFQlVHO1xuICB9XG5cbiAgcmV0dXJuIHI7XG59XG5cbi8qKlxuICogRW5hYmxlIG5hbWVzcGFjZXMgbGlzdGVkIGluIGBsb2NhbFN0b3JhZ2UuZGVidWdgIGluaXRpYWxseS5cbiAqL1xuXG5leHBvcnRzLmVuYWJsZShsb2FkKCkpO1xuXG4vKipcbiAqIExvY2Fsc3RvcmFnZSBhdHRlbXB0cyB0byByZXR1cm4gdGhlIGxvY2Fsc3RvcmFnZS5cbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHNhZmFyaSB0aHJvd3NcbiAqIHdoZW4gYSB1c2VyIGRpc2FibGVzIGNvb2tpZXMvbG9jYWxzdG9yYWdlXG4gKiBhbmQgeW91IGF0dGVtcHQgdG8gYWNjZXNzIGl0LlxuICpcbiAqIEByZXR1cm4ge0xvY2FsU3RvcmFnZX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvY2Fsc3RvcmFnZSgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZTtcbiAgfSBjYXRjaCAoZSkge31cbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJykpXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5a1pXSjFaeTl6Y21NdlluSnZkM05sY2k1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaThxS2x4dUlDb2dWR2hwY3lCcGN5QjBhR1VnZDJWaUlHSnliM2R6WlhJZ2FXMXdiR1Z0Wlc1MFlYUnBiMjRnYjJZZ1lHUmxZblZuS0NsZ0xseHVJQ3BjYmlBcUlFVjRjRzl6WlNCZ1pHVmlkV2NvS1dBZ1lYTWdkR2hsSUcxdlpIVnNaUzVjYmlBcUwxeHVYRzVsZUhCdmNuUnpJRDBnYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0J5WlhGMWFYSmxLQ2N1TDJSbFluVm5KeWs3WEc1bGVIQnZjblJ6TG14dlp5QTlJR3h2Wnp0Y2JtVjRjRzl5ZEhNdVptOXliV0YwUVhKbmN5QTlJR1p2Y20xaGRFRnlaM003WEc1bGVIQnZjblJ6TG5OaGRtVWdQU0J6WVhabE8xeHVaWGh3YjNKMGN5NXNiMkZrSUQwZ2JHOWhaRHRjYm1WNGNHOXlkSE11ZFhObFEyOXNiM0p6SUQwZ2RYTmxRMjlzYjNKek8xeHVaWGh3YjNKMGN5NXpkRzl5WVdkbElEMGdKM1Z1WkdWbWFXNWxaQ2NnSVQwZ2RIbHdaVzltSUdOb2NtOXRaVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKaVlnSjNWdVpHVm1hVzVsWkNjZ0lUMGdkSGx3Wlc5bUlHTm9jbTl0WlM1emRHOXlZV2RsWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBL0lHTm9jbTl0WlM1emRHOXlZV2RsTG14dlkyRnNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0E2SUd4dlkyRnNjM1J2Y21GblpTZ3BPMXh1WEc0dktpcGNiaUFxSUVOdmJHOXljeTVjYmlBcUwxeHVYRzVsZUhCdmNuUnpMbU52Ykc5eWN5QTlJRnRjYmlBZ0p5TXdNREF3UTBNbkxDQW5JekF3TURCR1JpY3NJQ2NqTURBek0wTkRKeXdnSnlNd01ETXpSa1luTENBbkl6QXdOalpEUXljc0lDY2pNREEyTmtaR0p5d2dKeU13TURrNVEwTW5MRnh1SUNBbkl6QXdPVGxHUmljc0lDY2pNREJEUXpBd0p5d2dKeU13TUVORE16TW5MQ0FuSXpBd1EwTTJOaWNzSUNjak1EQkRRems1Snl3Z0p5TXdNRU5EUTBNbkxDQW5JekF3UTBOR1JpY3NYRzRnSUNjak16TXdNRU5ESnl3Z0p5TXpNekF3UmtZbkxDQW5Jek16TXpORFF5Y3NJQ2NqTXpNek0wWkdKeXdnSnlNek16WTJRME1uTENBbkl6TXpOalpHUmljc0lDY2pNek01T1VOREp5eGNiaUFnSnlNek16azVSa1luTENBbkl6TXpRME13TUNjc0lDY2pNek5EUXpNekp5d2dKeU16TTBORE5qWW5MQ0FuSXpNelEwTTVPU2NzSUNjak16TkRRME5ESnl3Z0p5TXpNME5EUmtZbkxGeHVJQ0FuSXpZMk1EQkRReWNzSUNjak5qWXdNRVpHSnl3Z0p5TTJOak16UTBNbkxDQW5JelkyTXpOR1JpY3NJQ2NqTmpaRFF6QXdKeXdnSnlNMk5rTkRNek1uTENBbkl6azVNREJEUXljc1hHNGdJQ2NqT1Rrd01FWkdKeXdnSnlNNU9UTXpRME1uTENBbkl6azVNek5HUmljc0lDY2pPVGxEUXpBd0p5d2dKeU01T1VORE16TW5MQ0FuSTBORE1EQXdNQ2NzSUNjalEwTXdNRE16Snl4Y2JpQWdKeU5EUXpBd05qWW5MQ0FuSTBORE1EQTVPU2NzSUNjalEwTXdNRU5ESnl3Z0p5TkRRekF3UmtZbkxDQW5JME5ETXpNd01DY3NJQ2NqUTBNek16TXpKeXdnSnlORFF6TXpOalluTEZ4dUlDQW5JME5ETXpNNU9TY3NJQ2NqUTBNek0wTkRKeXdnSnlORFF6TXpSa1luTENBbkkwTkROall3TUNjc0lDY2pRME0yTmpNekp5d2dKeU5EUXprNU1EQW5MQ0FuSTBORE9Ua3pNeWNzWEc0Z0lDY2pRME5EUXpBd0p5d2dKeU5EUTBORE16TW5MQ0FuSTBaR01EQXdNQ2NzSUNjalJrWXdNRE16Snl3Z0p5TkdSakF3TmpZbkxDQW5JMFpHTURBNU9TY3NJQ2NqUmtZd01FTkRKeXhjYmlBZ0p5TkdSakF3UmtZbkxDQW5JMFpHTXpNd01DY3NJQ2NqUmtZek16TXpKeXdnSnlOR1JqTXpOalluTENBbkkwWkdNek01T1Njc0lDY2pSa1l6TTBOREp5d2dKeU5HUmpNelJrWW5MRnh1SUNBbkkwWkdOall3TUNjc0lDY2pSa1kyTmpNekp5d2dKeU5HUmprNU1EQW5MQ0FuSTBaR09Ua3pNeWNzSUNjalJrWkRRekF3Snl3Z0p5TkdSa05ETXpNblhHNWRPMXh1WEc0dktpcGNiaUFxSUVOMWNuSmxiblJzZVNCdmJteDVJRmRsWWt0cGRDMWlZWE5sWkNCWFpXSWdTVzV6Y0dWamRHOXljeXdnUm1seVpXWnZlQ0ErUFNCMk16RXNYRzRnS2lCaGJtUWdkR2hsSUVacGNtVmlkV2NnWlhoMFpXNXphVzl1SUNoaGJua2dSbWx5WldadmVDQjJaWEp6YVc5dUtTQmhjbVVnYTI1dmQyNWNiaUFxSUhSdklITjFjSEJ2Y25RZ1hDSWxZMXdpSUVOVFV5QmpkWE4wYjIxcGVtRjBhVzl1Y3k1Y2JpQXFYRzRnS2lCVVQwUlBPaUJoWkdRZ1lTQmdiRzlqWVd4VGRHOXlZV2RsWUNCMllYSnBZV0pzWlNCMGJ5QmxlSEJzYVdOcGRHeDVJR1Z1WVdKc1pTOWthWE5oWW14bElHTnZiRzl5YzF4dUlDb3ZYRzVjYm1aMWJtTjBhVzl1SUhWelpVTnZiRzl5Y3lncElIdGNiaUFnTHk4Z1RrSTZJRWx1SUdGdUlFVnNaV04wY205dUlIQnlaV3h2WVdRZ2MyTnlhWEIwTENCa2IyTjFiV1Z1ZENCM2FXeHNJR0psSUdSbFptbHVaV1FnWW5WMElHNXZkQ0JtZFd4c2VWeHVJQ0F2THlCcGJtbDBhV0ZzYVhwbFpDNGdVMmx1WTJVZ2QyVWdhMjV2ZHlCM1pTZHlaU0JwYmlCRGFISnZiV1VzSUhkbEoyeHNJR3AxYzNRZ1pHVjBaV04wSUhSb2FYTWdZMkZ6WlZ4dUlDQXZMeUJsZUhCc2FXTnBkR3g1WEc0Z0lHbG1JQ2gwZVhCbGIyWWdkMmx1Wkc5M0lDRTlQU0FuZFc1a1pXWnBibVZrSnlBbUppQjNhVzVrYjNjdWNISnZZMlZ6Y3lBbUppQjNhVzVrYjNjdWNISnZZMlZ6Y3k1MGVYQmxJRDA5UFNBbmNtVnVaR1Z5WlhJbktTQjdYRzRnSUNBZ2NtVjBkWEp1SUhSeWRXVTdYRzRnSUgxY2JseHVJQ0F2THlCSmJuUmxjbTVsZENCRmVIQnNiM0psY2lCaGJtUWdSV1JuWlNCa2J5QnViM1FnYzNWd2NHOXlkQ0JqYjJ4dmNuTXVYRzRnSUdsbUlDaDBlWEJsYjJZZ2JtRjJhV2RoZEc5eUlDRTlQU0FuZFc1a1pXWnBibVZrSnlBbUppQnVZWFpwWjJGMGIzSXVkWE5sY2tGblpXNTBJQ1ltSUc1aGRtbG5ZWFJ2Y2k1MWMyVnlRV2RsYm5RdWRHOU1iM2RsY2tOaGMyVW9LUzV0WVhSamFDZ3ZLR1ZrWjJWOGRISnBaR1Z1ZENsY1hDOG9YRnhrS3lrdktTa2dlMXh1SUNBZ0lISmxkSFZ5YmlCbVlXeHpaVHRjYmlBZ2ZWeHVYRzRnSUM4dklHbHpJSGRsWW10cGREOGdhSFIwY0RvdkwzTjBZV05yYjNabGNtWnNiM2N1WTI5dEwyRXZNVFkwTlRrMk1EWXZNemMyTnpjelhHNGdJQzh2SUdSdlkzVnRaVzUwSUdseklIVnVaR1ZtYVc1bFpDQnBiaUJ5WldGamRDMXVZWFJwZG1VNklHaDBkSEJ6T2k4dloybDBhSFZpTG1OdmJTOW1ZV05sWW05dmF5OXlaV0ZqZEMxdVlYUnBkbVV2Y0hWc2JDOHhOak15WEc0Z0lISmxkSFZ5YmlBb2RIbHdaVzltSUdSdlkzVnRaVzUwSUNFOVBTQW5kVzVrWldacGJtVmtKeUFtSmlCa2IyTjFiV1Z1ZEM1a2IyTjFiV1Z1ZEVWc1pXMWxiblFnSmlZZ1pHOWpkVzFsYm5RdVpHOWpkVzFsYm5SRmJHVnRaVzUwTG5OMGVXeGxJQ1ltSUdSdlkzVnRaVzUwTG1SdlkzVnRaVzUwUld4bGJXVnVkQzV6ZEhsc1pTNVhaV0pyYVhSQmNIQmxZWEpoYm1ObEtTQjhmRnh1SUNBZ0lDOHZJR2x6SUdacGNtVmlkV2MvSUdoMGRIQTZMeTl6ZEdGamEyOTJaWEptYkc5M0xtTnZiUzloTHpNNU9ERXlNQzh6TnpZM056TmNiaUFnSUNBb2RIbHdaVzltSUhkcGJtUnZkeUFoUFQwZ0ozVnVaR1ZtYVc1bFpDY2dKaVlnZDJsdVpHOTNMbU52Ym5OdmJHVWdKaVlnS0hkcGJtUnZkeTVqYjI1emIyeGxMbVpwY21WaWRXY2dmSHdnS0hkcGJtUnZkeTVqYjI1emIyeGxMbVY0WTJWd2RHbHZiaUFtSmlCM2FXNWtiM2N1WTI5dWMyOXNaUzUwWVdKc1pTa3BLU0I4ZkZ4dUlDQWdJQzh2SUdseklHWnBjbVZtYjNnZ1BqMGdkak14UDF4dUlDQWdJQzh2SUdoMGRIQnpPaTh2WkdWMlpXeHZjR1Z5TG0xdmVtbHNiR0V1YjNKbkwyVnVMVlZUTDJSdlkzTXZWRzl2YkhNdlYyVmlYME52Ym5OdmJHVWpVM1I1YkdsdVoxOXRaWE56WVdkbGMxeHVJQ0FnSUNoMGVYQmxiMllnYm1GMmFXZGhkRzl5SUNFOVBTQW5kVzVrWldacGJtVmtKeUFtSmlCdVlYWnBaMkYwYjNJdWRYTmxja0ZuWlc1MElDWW1JRzVoZG1sbllYUnZjaTUxYzJWeVFXZGxiblF1ZEc5TWIzZGxja05oYzJVb0tTNXRZWFJqYUNndlptbHlaV1p2ZUZ4Y0x5aGNYR1FyS1M4cElDWW1JSEJoY25ObFNXNTBLRkpsWjBWNGNDNGtNU3dnTVRBcElENDlJRE14S1NCOGZGeHVJQ0FnSUM4dklHUnZkV0pzWlNCamFHVmpheUIzWldKcmFYUWdhVzRnZFhObGNrRm5aVzUwSUdwMWMzUWdhVzRnWTJGelpTQjNaU0JoY21VZ2FXNGdZU0IzYjNKclpYSmNiaUFnSUNBb2RIbHdaVzltSUc1aGRtbG5ZWFJ2Y2lBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NnSmlZZ2JtRjJhV2RoZEc5eUxuVnpaWEpCWjJWdWRDQW1KaUJ1WVhacFoyRjBiM0l1ZFhObGNrRm5aVzUwTG5SdlRHOTNaWEpEWVhObEtDa3ViV0YwWTJnb0wyRndjR3hsZDJWaWEybDBYRnd2S0Z4Y1pDc3BMeWtwTzF4dWZWeHVYRzR2S2lwY2JpQXFJRTFoY0NBbGFpQjBieUJnU2xOUFRpNXpkSEpwYm1kcFpua29LV0FzSUhOcGJtTmxJRzV2SUZkbFlpQkpibk53WldOMGIzSnpJR1J2SUhSb1lYUWdZbmtnWkdWbVlYVnNkQzVjYmlBcUwxeHVYRzVsZUhCdmNuUnpMbVp2Y20xaGRIUmxjbk11YWlBOUlHWjFibU4wYVc5dUtIWXBJSHRjYmlBZ2RISjVJSHRjYmlBZ0lDQnlaWFIxY200Z1NsTlBUaTV6ZEhKcGJtZHBabmtvZGlrN1hHNGdJSDBnWTJGMFkyZ2dLR1Z5Y2lrZ2UxeHVJQ0FnSUhKbGRIVnliaUFuVzFWdVpYaHdaV04wWldSS1UwOU9VR0Z5YzJWRmNuSnZjbDA2SUNjZ0t5Qmxjbkl1YldWemMyRm5aVHRjYmlBZ2ZWeHVmVHRjYmx4dVhHNHZLaXBjYmlBcUlFTnZiRzl5YVhwbElHeHZaeUJoY21kMWJXVnVkSE1nYVdZZ1pXNWhZbXhsWkM1Y2JpQXFYRzRnS2lCQVlYQnBJSEIxWW14cFkxeHVJQ292WEc1Y2JtWjFibU4wYVc5dUlHWnZjbTFoZEVGeVozTW9ZWEpuY3lrZ2UxeHVJQ0IyWVhJZ2RYTmxRMjlzYjNKeklEMGdkR2hwY3k1MWMyVkRiMnh2Y25NN1hHNWNiaUFnWVhKbmMxc3dYU0E5SUNoMWMyVkRiMnh2Y25NZ1B5QW5KV01uSURvZ0p5Y3BYRzRnSUNBZ0t5QjBhR2x6TG01aGJXVnpjR0ZqWlZ4dUlDQWdJQ3NnS0hWelpVTnZiRzl5Y3lBL0lDY2dKV01uSURvZ0p5QW5LVnh1SUNBZ0lDc2dZWEpuYzFzd1hWeHVJQ0FnSUNzZ0tIVnpaVU52Ykc5eWN5QS9JQ2NsWXlBbklEb2dKeUFuS1Z4dUlDQWdJQ3NnSnlzbklDc2daWGh3YjNKMGN5NW9kVzFoYm1sNlpTaDBhR2x6TG1ScFptWXBPMXh1WEc0Z0lHbG1JQ2doZFhObFEyOXNiM0p6S1NCeVpYUjFjbTQ3WEc1Y2JpQWdkbUZ5SUdNZ1BTQW5ZMjlzYjNJNklDY2dLeUIwYUdsekxtTnZiRzl5TzF4dUlDQmhjbWR6TG5Od2JHbGpaU2d4TENBd0xDQmpMQ0FuWTI5c2IzSTZJR2x1YUdWeWFYUW5LVnh1WEc0Z0lDOHZJSFJvWlNCbWFXNWhiQ0JjSWlWalhDSWdhWE1nYzI5dFpYZG9ZWFFnZEhKcFkydDVMQ0JpWldOaGRYTmxJSFJvWlhKbElHTnZkV3hrSUdKbElHOTBhR1Z5WEc0Z0lDOHZJR0Z5WjNWdFpXNTBjeUJ3WVhOelpXUWdaV2wwYUdWeUlHSmxabTl5WlNCdmNpQmhablJsY2lCMGFHVWdKV01zSUhOdklIZGxJRzVsWldRZ2RHOWNiaUFnTHk4Z1ptbG5kWEpsSUc5MWRDQjBhR1VnWTI5eWNtVmpkQ0JwYm1SbGVDQjBieUJwYm5ObGNuUWdkR2hsSUVOVFV5QnBiblJ2WEc0Z0lIWmhjaUJwYm1SbGVDQTlJREE3WEc0Z0lIWmhjaUJzWVhOMFF5QTlJREE3WEc0Z0lHRnlaM05iTUYwdWNtVndiR0ZqWlNndkpWdGhMWHBCTFZvbFhTOW5MQ0JtZFc1amRHbHZiaWh0WVhSamFDa2dlMXh1SUNBZ0lHbG1JQ2duSlNVbklEMDlQU0J0WVhSamFDa2djbVYwZFhKdU8xeHVJQ0FnSUdsdVpHVjRLeXM3WEc0Z0lDQWdhV1lnS0NjbFl5Y2dQVDA5SUcxaGRHTm9LU0I3WEc0Z0lDQWdJQ0F2THlCM1pTQnZibXg1SUdGeVpTQnBiblJsY21WemRHVmtJR2x1SUhSb1pTQXFiR0Z6ZENvZ0pXTmNiaUFnSUNBZ0lDOHZJQ2gwYUdVZ2RYTmxjaUJ0WVhrZ2FHRjJaU0J3Y205MmFXUmxaQ0IwYUdWcGNpQnZkMjRwWEc0Z0lDQWdJQ0JzWVhOMFF5QTlJR2x1WkdWNE8xeHVJQ0FnSUgxY2JpQWdmU2s3WEc1Y2JpQWdZWEpuY3k1emNHeHBZMlVvYkdGemRFTXNJREFzSUdNcE8xeHVmVnh1WEc0dktpcGNiaUFxSUVsdWRtOXJaWE1nWUdOdmJuTnZiR1V1Ykc5bktDbGdJSGRvWlc0Z1lYWmhhV3hoWW14bExseHVJQ29nVG04dGIzQWdkMmhsYmlCZ1kyOXVjMjlzWlM1c2IyZGdJR2x6SUc1dmRDQmhJRndpWm5WdVkzUnBiMjVjSWk1Y2JpQXFYRzRnS2lCQVlYQnBJSEIxWW14cFkxeHVJQ292WEc1Y2JtWjFibU4wYVc5dUlHeHZaeWdwSUh0Y2JpQWdMeThnZEdocGN5Qm9ZV05yWlhKNUlHbHpJSEpsY1hWcGNtVmtJR1p2Y2lCSlJUZ3ZPU3dnZDJobGNtVmNiaUFnTHk4Z2RHaGxJR0JqYjI1emIyeGxMbXh2WjJBZ1puVnVZM1JwYjI0Z1pHOWxjMjRuZENCb1lYWmxJQ2RoY0hCc2VTZGNiaUFnY21WMGRYSnVJQ2R2WW1wbFkzUW5JRDA5UFNCMGVYQmxiMllnWTI5dWMyOXNaVnh1SUNBZ0lDWW1JR052Ym5OdmJHVXViRzluWEc0Z0lDQWdKaVlnUm5WdVkzUnBiMjR1Y0hKdmRHOTBlWEJsTG1Gd2NHeDVMbU5oYkd3b1kyOXVjMjlzWlM1c2IyY3NJR052Ym5OdmJHVXNJR0Z5WjNWdFpXNTBjeWs3WEc1OVhHNWNiaThxS2x4dUlDb2dVMkYyWlNCZ2JtRnRaWE53WVdObGMyQXVYRzRnS2x4dUlDb2dRSEJoY21GdElIdFRkSEpwYm1kOUlHNWhiV1Z6Y0dGalpYTmNiaUFxSUVCaGNHa2djSEpwZG1GMFpWeHVJQ292WEc1Y2JtWjFibU4wYVc5dUlITmhkbVVvYm1GdFpYTndZV05sY3lrZ2UxeHVJQ0IwY25rZ2UxeHVJQ0FnSUdsbUlDaHVkV3hzSUQwOUlHNWhiV1Z6Y0dGalpYTXBJSHRjYmlBZ0lDQWdJR1Y0Y0c5eWRITXVjM1J2Y21GblpTNXlaVzF2ZG1WSmRHVnRLQ2RrWldKMVp5Y3BPMXh1SUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNCbGVIQnZjblJ6TG5OMGIzSmhaMlV1WkdWaWRXY2dQU0J1WVcxbGMzQmhZMlZ6TzF4dUlDQWdJSDFjYmlBZ2ZTQmpZWFJqYUNobEtTQjdmVnh1ZlZ4dVhHNHZLaXBjYmlBcUlFeHZZV1FnWUc1aGJXVnpjR0ZqWlhOZ0xseHVJQ3BjYmlBcUlFQnlaWFIxY200Z2UxTjBjbWx1WjMwZ2NtVjBkWEp1Y3lCMGFHVWdjSEpsZG1sdmRYTnNlU0J3WlhKemFYTjBaV1FnWkdWaWRXY2diVzlrWlhOY2JpQXFJRUJoY0drZ2NISnBkbUYwWlZ4dUlDb3ZYRzVjYm1aMWJtTjBhVzl1SUd4dllXUW9LU0I3WEc0Z0lIWmhjaUJ5TzF4dUlDQjBjbmtnZTF4dUlDQWdJSElnUFNCbGVIQnZjblJ6TG5OMGIzSmhaMlV1WkdWaWRXYzdYRzRnSUgwZ1kyRjBZMmdvWlNrZ2UzMWNibHh1SUNBdkx5QkpaaUJrWldKMVp5QnBjMjRuZENCelpYUWdhVzRnVEZNc0lHRnVaQ0IzWlNkeVpTQnBiaUJGYkdWamRISnZiaXdnZEhKNUlIUnZJR3h2WVdRZ0pFUkZRbFZIWEc0Z0lHbG1JQ2doY2lBbUppQjBlWEJsYjJZZ2NISnZZMlZ6Y3lBaFBUMGdKM1Z1WkdWbWFXNWxaQ2NnSmlZZ0oyVnVkaWNnYVc0Z2NISnZZMlZ6Y3lrZ2UxeHVJQ0FnSUhJZ1BTQndjbTlqWlhOekxtVnVkaTVFUlVKVlJ6dGNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQnlPMXh1ZlZ4dVhHNHZLaXBjYmlBcUlFVnVZV0pzWlNCdVlXMWxjM0JoWTJWeklHeHBjM1JsWkNCcGJpQmdiRzlqWVd4VGRHOXlZV2RsTG1SbFluVm5ZQ0JwYm1sMGFXRnNiSGt1WEc0Z0tpOWNibHh1Wlhod2IzSjBjeTVsYm1GaWJHVW9iRzloWkNncEtUdGNibHh1THlvcVhHNGdLaUJNYjJOaGJITjBiM0poWjJVZ1lYUjBaVzF3ZEhNZ2RHOGdjbVYwZFhKdUlIUm9aU0JzYjJOaGJITjBiM0poWjJVdVhHNGdLbHh1SUNvZ1ZHaHBjeUJwY3lCdVpXTmxjM05oY25rZ1ltVmpZWFZ6WlNCellXWmhjbWtnZEdoeWIzZHpYRzRnS2lCM2FHVnVJR0VnZFhObGNpQmthWE5oWW14bGN5QmpiMjlyYVdWekwyeHZZMkZzYzNSdmNtRm5aVnh1SUNvZ1lXNWtJSGx2ZFNCaGRIUmxiWEIwSUhSdklHRmpZMlZ6Y3lCcGRDNWNiaUFxWEc0Z0tpQkFjbVYwZFhKdUlIdE1iMk5oYkZOMGIzSmhaMlY5WEc0Z0tpQkFZWEJwSUhCeWFYWmhkR1ZjYmlBcUwxeHVYRzVtZFc1amRHbHZiaUJzYjJOaGJITjBiM0poWjJVb0tTQjdYRzRnSUhSeWVTQjdYRzRnSUNBZ2NtVjBkWEp1SUhkcGJtUnZkeTVzYjJOaGJGTjBiM0poWjJVN1hHNGdJSDBnWTJGMFkyZ2dLR1VwSUh0OVhHNTlYRzRpWFgwPSIsIlxuLyoqXG4gKiBUaGlzIGlzIHRoZSBjb21tb24gbG9naWMgZm9yIGJvdGggdGhlIE5vZGUuanMgYW5kIHdlYiBicm93c2VyXG4gKiBpbXBsZW1lbnRhdGlvbnMgb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVEZWJ1Zy5kZWJ1ZyA9IGNyZWF0ZURlYnVnWydkZWZhdWx0J10gPSBjcmVhdGVEZWJ1ZztcbmV4cG9ydHMuY29lcmNlID0gY29lcmNlO1xuZXhwb3J0cy5kaXNhYmxlID0gZGlzYWJsZTtcbmV4cG9ydHMuZW5hYmxlID0gZW5hYmxlO1xuZXhwb3J0cy5lbmFibGVkID0gZW5hYmxlZDtcbmV4cG9ydHMuaHVtYW5pemUgPSByZXF1aXJlKCdtcycpO1xuXG4vKipcbiAqIEFjdGl2ZSBgZGVidWdgIGluc3RhbmNlcy5cbiAqL1xuZXhwb3J0cy5pbnN0YW5jZXMgPSBbXTtcblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLCBhbmQgbmFtZXMgdG8gc2tpcC5cbiAqL1xuXG5leHBvcnRzLm5hbWVzID0gW107XG5leHBvcnRzLnNraXBzID0gW107XG5cbi8qKlxuICogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuICpcbiAqIFZhbGlkIGtleSBuYW1lcyBhcmUgYSBzaW5nbGUsIGxvd2VyIG9yIHVwcGVyLWNhc2UgbGV0dGVyLCBpLmUuIFwiblwiIGFuZCBcIk5cIi5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMgPSB7fTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlbGVjdENvbG9yKG5hbWVzcGFjZSkge1xuICB2YXIgaGFzaCA9IDAsIGk7XG5cbiAgZm9yIChpIGluIG5hbWVzcGFjZSkge1xuICAgIGhhc2ggID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBuYW1lc3BhY2UuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICB9XG5cbiAgcmV0dXJuIGV4cG9ydHMuY29sb3JzW01hdGguYWJzKGhhc2gpICUgZXhwb3J0cy5jb2xvcnMubGVuZ3RoXTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZXNwYWNlYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlRGVidWcobmFtZXNwYWNlKSB7XG5cbiAgdmFyIHByZXZUaW1lO1xuXG4gIGZ1bmN0aW9uIGRlYnVnKCkge1xuICAgIC8vIGRpc2FibGVkP1xuICAgIGlmICghZGVidWcuZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgdmFyIHNlbGYgPSBkZWJ1ZztcblxuICAgIC8vIHNldCBgZGlmZmAgdGltZXN0YW1wXG4gICAgdmFyIGN1cnIgPSArbmV3IERhdGUoKTtcbiAgICB2YXIgbXMgPSBjdXJyIC0gKHByZXZUaW1lIHx8IGN1cnIpO1xuICAgIHNlbGYuZGlmZiA9IG1zO1xuICAgIHNlbGYucHJldiA9IHByZXZUaW1lO1xuICAgIHNlbGYuY3VyciA9IGN1cnI7XG4gICAgcHJldlRpbWUgPSBjdXJyO1xuXG4gICAgLy8gdHVybiB0aGUgYGFyZ3VtZW50c2AgaW50byBhIHByb3BlciBBcnJheVxuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBhcmdzWzBdID0gZXhwb3J0cy5jb2VyY2UoYXJnc1swXSk7XG5cbiAgICBpZiAoJ3N0cmluZycgIT09IHR5cGVvZiBhcmdzWzBdKSB7XG4gICAgICAvLyBhbnl0aGluZyBlbHNlIGxldCdzIGluc3BlY3Qgd2l0aCAlT1xuICAgICAgYXJncy51bnNoaWZ0KCclTycpO1xuICAgIH1cblxuICAgIC8vIGFwcGx5IGFueSBgZm9ybWF0dGVyc2AgdHJhbnNmb3JtYXRpb25zXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBhcmdzWzBdID0gYXJnc1swXS5yZXBsYWNlKC8lKFthLXpBLVolXSkvZywgZnVuY3Rpb24obWF0Y2gsIGZvcm1hdCkge1xuICAgICAgLy8gaWYgd2UgZW5jb3VudGVyIGFuIGVzY2FwZWQgJSB0aGVuIGRvbid0IGluY3JlYXNlIHRoZSBhcnJheSBpbmRleFxuICAgICAgaWYgKG1hdGNoID09PSAnJSUnKSByZXR1cm4gbWF0Y2g7XG4gICAgICBpbmRleCsrO1xuICAgICAgdmFyIGZvcm1hdHRlciA9IGV4cG9ydHMuZm9ybWF0dGVyc1tmb3JtYXRdO1xuICAgICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBmb3JtYXR0ZXIpIHtcbiAgICAgICAgdmFyIHZhbCA9IGFyZ3NbaW5kZXhdO1xuICAgICAgICBtYXRjaCA9IGZvcm1hdHRlci5jYWxsKHNlbGYsIHZhbCk7XG5cbiAgICAgICAgLy8gbm93IHdlIG5lZWQgdG8gcmVtb3ZlIGBhcmdzW2luZGV4XWAgc2luY2UgaXQncyBpbmxpbmVkIGluIHRoZSBgZm9ybWF0YFxuICAgICAgICBhcmdzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGluZGV4LS07XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG5cbiAgICAvLyBhcHBseSBlbnYtc3BlY2lmaWMgZm9ybWF0dGluZyAoY29sb3JzLCBldGMuKVxuICAgIGV4cG9ydHMuZm9ybWF0QXJncy5jYWxsKHNlbGYsIGFyZ3MpO1xuXG4gICAgdmFyIGxvZ0ZuID0gZGVidWcubG9nIHx8IGV4cG9ydHMubG9nIHx8IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7XG4gICAgbG9nRm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cblxuICBkZWJ1Zy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gIGRlYnVnLmVuYWJsZWQgPSBleHBvcnRzLmVuYWJsZWQobmFtZXNwYWNlKTtcbiAgZGVidWcudXNlQ29sb3JzID0gZXhwb3J0cy51c2VDb2xvcnMoKTtcbiAgZGVidWcuY29sb3IgPSBzZWxlY3RDb2xvcihuYW1lc3BhY2UpO1xuICBkZWJ1Zy5kZXN0cm95ID0gZGVzdHJveTtcblxuICAvLyBlbnYtc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24gbG9naWMgZm9yIGRlYnVnIGluc3RhbmNlc1xuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGV4cG9ydHMuaW5pdCkge1xuICAgIGV4cG9ydHMuaW5pdChkZWJ1Zyk7XG4gIH1cblxuICBleHBvcnRzLmluc3RhbmNlcy5wdXNoKGRlYnVnKTtcblxuICByZXR1cm4gZGVidWc7XG59XG5cbmZ1bmN0aW9uIGRlc3Ryb3kgKCkge1xuICB2YXIgaW5kZXggPSBleHBvcnRzLmluc3RhbmNlcy5pbmRleE9mKHRoaXMpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgZXhwb3J0cy5pbnN0YW5jZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmFibGVzIGEgZGVidWcgbW9kZSBieSBuYW1lc3BhY2VzLiBUaGlzIGNhbiBpbmNsdWRlIG1vZGVzXG4gKiBzZXBhcmF0ZWQgYnkgYSBjb2xvbiBhbmQgd2lsZGNhcmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGVuYWJsZShuYW1lc3BhY2VzKSB7XG4gIGV4cG9ydHMuc2F2ZShuYW1lc3BhY2VzKTtcblxuICBleHBvcnRzLm5hbWVzID0gW107XG4gIGV4cG9ydHMuc2tpcHMgPSBbXTtcblxuICB2YXIgaTtcbiAgdmFyIHNwbGl0ID0gKHR5cGVvZiBuYW1lc3BhY2VzID09PSAnc3RyaW5nJyA/IG5hbWVzcGFjZXMgOiAnJykuc3BsaXQoL1tcXHMsXSsvKTtcbiAgdmFyIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoIXNwbGl0W2ldKSBjb250aW51ZTsgLy8gaWdub3JlIGVtcHR5IHN0cmluZ3NcbiAgICBuYW1lc3BhY2VzID0gc3BsaXRbaV0ucmVwbGFjZSgvXFwqL2csICcuKj8nKTtcbiAgICBpZiAobmFtZXNwYWNlc1swXSA9PT0gJy0nKSB7XG4gICAgICBleHBvcnRzLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzLnN1YnN0cigxKSArICckJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzICsgJyQnKSk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IGV4cG9ydHMuaW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGluc3RhbmNlID0gZXhwb3J0cy5pbnN0YW5jZXNbaV07XG4gICAgaW5zdGFuY2UuZW5hYmxlZCA9IGV4cG9ydHMuZW5hYmxlZChpbnN0YW5jZS5uYW1lc3BhY2UpO1xuICB9XG59XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkaXNhYmxlKCkge1xuICBleHBvcnRzLmVuYWJsZSgnJyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGVkKG5hbWUpIHtcbiAgaWYgKG5hbWVbbmFtZS5sZW5ndGggLSAxXSA9PT0gJyonKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIGksIGxlbjtcbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLnNraXBzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLm5hbWVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsIi8qKlxuICogSGVscGVycy5cbiAqL1xuXG52YXIgcyA9IDEwMDA7XG52YXIgbSA9IHMgKiA2MDtcbnZhciBoID0gbSAqIDYwO1xudmFyIGQgPSBoICogMjQ7XG52YXIgeSA9IGQgKiAzNjUuMjU7XG5cbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgdmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSBudW1iZXJcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG4gIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiB2YWwubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBwYXJzZSh2YWwpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmIGlzTmFOKHZhbCkgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMubG9uZyA/IGZtdExvbmcodmFsKSA6IGZtdFNob3J0KHZhbCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICd2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIHZhbGlkIG51bWJlci4gdmFsPScgK1xuICAgICAgSlNPTi5zdHJpbmdpZnkodmFsKVxuICApO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHN0ciA9IFN0cmluZyhzdHIpO1xuICBpZiAoc3RyLmxlbmd0aCA+IDEwMCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbWF0Y2ggPSAvXigoPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKFxuICAgIHN0clxuICApO1xuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gIHZhciB0eXBlID0gKG1hdGNoWzJdIHx8ICdtcycpLnRvTG93ZXJDYXNlKCk7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3llYXJzJzpcbiAgICBjYXNlICd5ZWFyJzpcbiAgICBjYXNlICd5cnMnOlxuICAgIGNhc2UgJ3lyJzpcbiAgICBjYXNlICd5JzpcbiAgICAgIHJldHVybiBuICogeTtcbiAgICBjYXNlICdkYXlzJzpcbiAgICBjYXNlICdkYXknOlxuICAgIGNhc2UgJ2QnOlxuICAgICAgcmV0dXJuIG4gKiBkO1xuICAgIGNhc2UgJ2hvdXJzJzpcbiAgICBjYXNlICdob3VyJzpcbiAgICBjYXNlICdocnMnOlxuICAgIGNhc2UgJ2hyJzpcbiAgICBjYXNlICdoJzpcbiAgICAgIHJldHVybiBuICogaDtcbiAgICBjYXNlICdtaW51dGVzJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ21pbnMnOlxuICAgIGNhc2UgJ21pbic6XG4gICAgY2FzZSAnbSc6XG4gICAgICByZXR1cm4gbiAqIG07XG4gICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgY2FzZSAnc2Vjb25kJzpcbiAgICBjYXNlICdzZWNzJzpcbiAgICBjYXNlICdzZWMnOlxuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuIG4gKiBzO1xuICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgIGNhc2UgJ21zZWNzJzpcbiAgICBjYXNlICdtc2VjJzpcbiAgICBjYXNlICdtcyc6XG4gICAgICByZXR1cm4gbjtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdFNob3J0KG1zKSB7XG4gIGlmIChtcyA+PSBkKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBkKSArICdkJztcbiAgfVxuICBpZiAobXMgPj0gaCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gaCkgKyAnaCc7XG4gIH1cbiAgaWYgKG1zID49IG0pIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG0pICsgJ20nO1xuICB9XG4gIGlmIChtcyA+PSBzKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBzKSArICdzJztcbiAgfVxuICByZXR1cm4gbXMgKyAnbXMnO1xufVxuXG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10TG9uZyhtcykge1xuICByZXR1cm4gcGx1cmFsKG1zLCBkLCAnZGF5JykgfHxcbiAgICBwbHVyYWwobXMsIGgsICdob3VyJykgfHxcbiAgICBwbHVyYWwobXMsIG0sICdtaW51dGUnKSB8fFxuICAgIHBsdXJhbChtcywgcywgJ3NlY29uZCcpIHx8XG4gICAgbXMgKyAnIG1zJztcbn1cblxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuXG5mdW5jdGlvbiBwbHVyYWwobXMsIG4sIG5hbWUpIHtcbiAgaWYgKG1zIDwgbikge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAobXMgPCBuICogMS41KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IobXMgLyBuKSArICcgJyArIG5hbWU7XG4gIH1cbiAgcmV0dXJuIE1hdGguY2VpbChtcyAvIG4pICsgJyAnICsgbmFtZSArICdzJztcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhbk11dGF0aW9uT2JzZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIHZhciBxdWV1ZSA9IFtdO1xuXG4gICAgaWYgKGNhbk11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgdmFyIGhpZGRlbkRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBxdWV1ZUxpc3QgPSBxdWV1ZS5zbGljZSgpO1xuICAgICAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHF1ZXVlTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShoaWRkZW5EaXYsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIGlmICghcXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaGlkZGVuRGl2LnNldEF0dHJpYnV0ZSgneWVzJywgJ25vJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJpbXBvcnQgZGVidWdMb2dnZXIgZnJvbSAnZGVidWcnO1xyXG5jb25zdCBkZWJ1ZyA9IGRlYnVnTG9nZ2VyKCdwaGFzZXItbW92ZS1hbmQtc3RvcC1wbHVnaW46bW92ZUFuZFN0b3AnKTtcclxuY29uc3QgZGVidWdPYmplY3RUb01vdmUgPSAob2JqZWN0c1RvTW92ZSwgb2JqZWN0VG9Nb3ZlLCBsYWJlbCkgPT4gZGVidWcoYCR7b2JqZWN0c1RvTW92ZS5pbmRleE9mKG9iamVjdFRvTW92ZSl9OiAke2xhYmVsfWApO1xyXG5cclxuY29uc3QgU1RBVEUgPSB7XHJcblx0aXNNb3Zpbmc6ICdpc01vdmluZycsXHJcblx0aGFzU3RvcHBlZDogJ2hhc1N0b3BwZWQnXHJcbn07XHJcblxyXG5mdW5jdGlvbiBmaW5kT2JqZWN0VG9Nb3ZlKG9iamVjdHNUb01vdmUsIGRpc3BsYXlPYmplY3QpIHtcclxuXHRpZiAoZGlzcGxheU9iamVjdCkge1xyXG5cdFx0cmV0dXJuIG9iamVjdHNUb01vdmUuZmluZChvYmplY3RUb01vdmUgPT4gb2JqZWN0VG9Nb3ZlLmRpc3BsYXlPYmplY3QgPT09IGRpc3BsYXlPYmplY3QpO1xyXG5cdH1cclxuXHRyZXR1cm4gdW5kZWZpbmVkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGREaXNwbGF5T2JqZWN0VG9MaXN0KG9iamVjdHNUb01vdmUsIGRpc3BsYXlPYmplY3QsIGluZm8gPSB7fSkge1xyXG5cdGNvbnN0IG9iamVjdFRvTW92ZSA9IHtcclxuXHRcdGRpc3BsYXlPYmplY3QsXHJcblx0XHRpbmZvXHJcblx0fTtcclxuXHRvYmplY3RzVG9Nb3ZlLnB1c2gob2JqZWN0VG9Nb3ZlKTtcclxuXHRkZWJ1Z09iamVjdFRvTW92ZShvYmplY3RzVG9Nb3ZlLCBvYmplY3RUb01vdmUsIGBhZGREaXNwbGF5T2JqZWN0VG9MaXN0IHg6JHtpbmZvLnh9IHk6JHtpbmZvLnl9IHNwZWVkOiR7aW5mby5zcGVlZH0gbWF4VGltZToke2luZm8ubWF4VGltZX0gZXZlbnRzOiR7aW5mby5ldmVudHMgPyBPYmplY3Qua2V5cyhpbmZvLmV2ZW50cykgOiBpbmZvLmV2ZW50c31gKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlT2JqZWN0VG9Nb3ZlKG9iamVjdHNUb01vdmUsIG9iamVjdFRvTW92ZSkge1xyXG5cdGRlYnVnT2JqZWN0VG9Nb3ZlKG9iamVjdHNUb01vdmUsIG9iamVjdFRvTW92ZSwgXCJyZW1vdmVPYmplY3RUb01vdmVcIik7XHJcblx0aWYgKG9iamVjdFRvTW92ZSkge1xyXG5cdFx0Y29uc3QgaW5kZXggPSBvYmplY3RzVG9Nb3ZlLmluZGV4T2Yob2JqZWN0VG9Nb3ZlKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdG9iamVjdHNUb01vdmUuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0b3BPYmplY3RNb3ZlbWVudChvYmplY3RUb01vdmUpIHtcclxuXHRjb25zdCB7IGRpc3BsYXlPYmplY3QsIGluZm8gfSA9IG9iamVjdFRvTW92ZTtcclxuXHRkaXNwbGF5T2JqZWN0LmJvZHkudmVsb2NpdHkueCA9IDA7XHJcblx0ZGlzcGxheU9iamVjdC5ib2R5LnZlbG9jaXR5LnkgPSAwO1xyXG5cclxuXHRpZiAoaW5mby5ldmVudHMpIHtcclxuXHRcdGlmIChpbmZvLmV2ZW50cy5vblBvc2l0aW9uUmVhY2hlZCkge1xyXG5cdFx0XHRpbmZvLmV2ZW50cy5vblBvc2l0aW9uUmVhY2hlZChkaXNwbGF5T2JqZWN0KTtcclxuXHRcdH1cclxuXHRcdGlmIChpbmZvLmV2ZW50cy5vblN0b3BwZWQpIHtcclxuXHRcdFx0aW5mby5ldmVudHMub25TdG9wcGVkKGRpc3BsYXlPYmplY3QpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0aW5mby5tb3ZlID0gU1RBVEUuaGFzU3RvcHBlZDtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlT2JqZWN0TW92ZW1lbnQoZ2FtZSwgb2JqZWN0VG9Nb3ZlKSB7XHJcblx0Y29uc3QgeyBkaXNwbGF5T2JqZWN0LCBpbmZvIH0gPSBvYmplY3RUb01vdmU7XHJcblx0aWYgKGRpc3BsYXlPYmplY3QuYWxpdmUgJiYgaW5mby5tb3ZlRGlzdEZyb21UYXJnZXQgJiYgZGlzcGxheU9iamVjdC5ib2R5KSB7XHJcblxyXG5cdFx0aWYgKGlzTW92aW5nKG9iamVjdFRvTW92ZSkpIHtcclxuXHRcdFx0Y29uc3QgdXBkYXRlZERpc3QgPSBnYW1lLnBoeXNpY3MuYXJjYWRlLmRpc3RhbmNlVG9YWShkaXNwbGF5T2JqZWN0LCBpbmZvLngsIGluZm8ueSk7XHJcblx0XHRcdGlmICh1cGRhdGVkRGlzdCA9PT0gMCB8fCB1cGRhdGVkRGlzdCA+IGluZm8ubW92ZURpc3RGcm9tVGFyZ2V0KSB7XHJcblx0XHRcdFx0Ly8gaWYgZGlzcGxheU9iamVjdCBpcyBzdGlsbCBtb3ZpbmcsIHdlIGFzayB0byBwYWhzZXIgdG8gc3RvcCBpdCAoc3RvcCB2ZWxvY2l0eSlcclxuXHRcdFx0XHRzdG9wT2JqZWN0TW92ZW1lbnQob2JqZWN0VG9Nb3ZlKTtcclxuXHRcdFx0XHQvLyB1cGRhdGUgY29vcmRpbmF0ZXNcclxuXHRcdFx0XHRkaXNwbGF5T2JqZWN0LnggPSBpbmZvLng7XHJcblx0XHRcdFx0ZGlzcGxheU9iamVjdC55ID0gaW5mby55O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vaWYgbm90IHN0b3BwZWQsIG9yIG5vIG5lZWQgdG8gc3RvcCwgd2UgdXBkYXRlIGxhc3QgZGlzdGFuY2UgYmV0d2VlbiBjdXJyZW50IGRpc3BsYXlPYmplY3QgYW5kIHRhcmdldHRlZCBjb3JyZGluYXRlc1xyXG5cdFx0XHRcdGluZm8ubW92ZURpc3RGcm9tVGFyZ2V0ID0gdXBkYXRlZERpc3Q7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzTW92aW5nKG9iamVjdFRvTW92ZSkge1xyXG5cdGNvbnN0IHsgaW5mbyB9ID0gb2JqZWN0VG9Nb3ZlO1xyXG5cdHJldHVybiBpbmZvLm1vdmUgPT09IFNUQVRFLmlzTW92aW5nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYXNTdG9wcGVkKG9iamVjdFRvTW92ZSkge1xyXG5cdGNvbnN0IHsgaW5mbyB9ID0gb2JqZWN0VG9Nb3ZlO1xyXG5cdHJldHVybiBpbmZvLm1vdmUgPT09IFNUQVRFLmhhc1N0b3BwZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwb3N0VXBkYXRlKG9iamVjdHNUb01vdmUsIGdhbWUpIHtcclxuXHRjb25zdCBvYmplY3RzTm90QWxpdmUgPSBbXTtcclxuXHRvYmplY3RzVG9Nb3ZlLmZvckVhY2gob2JqZWN0VG9Nb3ZlID0+IHtcclxuXHRcdGNvbnN0IHsgZGlzcGxheU9iamVjdCwgaW5mbyB9ID0gb2JqZWN0VG9Nb3ZlO1xyXG5cdFx0aWYgKCFkaXNwbGF5T2JqZWN0IHx8ICFkaXNwbGF5T2JqZWN0LmFsaXZlIHx8IGhhc1N0b3BwZWQob2JqZWN0VG9Nb3ZlKSkge1xyXG5cdFx0XHRpZiAoaW5mbyAmJiBpbmZvLmV2ZW50cykge1xyXG5cdFx0XHRcdGlmIChpbmZvLmV2ZW50cy5vblN0b3BwZWQpIHtcclxuXHRcdFx0XHRcdGluZm8uZXZlbnRzLm9uU3RvcHBlZChkaXNwbGF5T2JqZWN0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0b2JqZWN0c05vdEFsaXZlLnB1c2gob2JqZWN0VG9Nb3ZlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHVwZGF0ZU9iamVjdE1vdmVtZW50KGdhbWUsIG9iamVjdFRvTW92ZSk7XHJcblx0XHRcdGlmIChoYXNTdG9wcGVkKG9iamVjdFRvTW92ZSkpIHtcclxuXHRcdFx0XHRvYmplY3RzTm90QWxpdmUucHVzaChvYmplY3RUb01vdmUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdG9iamVjdHNOb3RBbGl2ZS5mb3JFYWNoKG9iamVjdFRvTW92ZSA9PiB7XHJcblx0XHRyZW1vdmVPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgb2JqZWN0VG9Nb3ZlKTtcclxuXHR9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlbU1vdmluZyhkaXNwbGF5T2JqZWN0KSB7XHJcblx0aWYgKCFkaXNwbGF5T2JqZWN0KSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaXMgdW5kZWZpbmVkXCIpO1xyXG5cdH1cclxuXHRyZXR1cm4gZGlzcGxheU9iamVjdC5ib2R5XHJcblx0XHQmJiBkaXNwbGF5T2JqZWN0LmJvZHkudmVsb2NpdHlcclxuXHRcdCYmIChkaXNwbGF5T2JqZWN0LmJvZHkudmVsb2NpdHkueCB8fCBkaXNwbGF5T2JqZWN0LmJvZHkudmVsb2NpdHkueSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtb3ZlVG9YWShvYmplY3RzVG9Nb3ZlLCBnYW1lLCBkaXNwbGF5T2JqZWN0LCB4LCB5LCBzcGVlZCwgbWF4VGltZSwgZXZlbnRzKSB7XHJcblx0aWYgKGRpc3BsYXlPYmplY3QgJiYgZGlzcGxheU9iamVjdC5hbGl2ZSAmJiBkaXNwbGF5T2JqZWN0LmJvZHkpIHtcclxuXHRcdGNvbnN0IG9iamVjdFRvTW92ZSA9IGZpbmRPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgZGlzcGxheU9iamVjdCk7XHJcblxyXG5cdFx0aWYgKCFvYmplY3RUb01vdmUgfHwgKFxyXG5cdFx0XHRvYmplY3RUb01vdmUuaW5mby54ICE9PSB4IHx8XHJcblx0XHRcdG9iamVjdFRvTW92ZS5pbmZvLnkgIT09IHkgfHxcclxuXHRcdFx0b2JqZWN0VG9Nb3ZlLmluZm8uc3BlZWQgIT09IHNwZWVkIHx8XHJcblx0XHRcdG9iamVjdFRvTW92ZS5pbmZvLm1heFRpbWUgIT09IG1heFRpbWUgfHxcclxuXHRcdFx0b2JqZWN0VG9Nb3ZlLmluZm8uZXZlbnRzICE9PSBldmVudHNcclxuXHRcdCkpIHtcclxuXHRcdFx0aWYgKG9iamVjdFRvTW92ZSkge1xyXG5cdFx0XHRcdHJlbW92ZU9iamVjdFRvTW92ZShvYmplY3RzVG9Nb3ZlLCBvYmplY3RUb01vdmUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNvbnN0IG1vdmVEaXN0RnJvbVRhcmdldCA9IGdhbWUucGh5c2ljcy5hcmNhZGUuZGlzdGFuY2VUb1hZKGRpc3BsYXlPYmplY3QsIHgsIHkpO1xyXG5cdFx0XHRhZGREaXNwbGF5T2JqZWN0VG9MaXN0KG9iamVjdHNUb01vdmUsIGRpc3BsYXlPYmplY3QsIHtcclxuXHRcdFx0XHRtb3ZlOiBTVEFURS5pc01vdmluZyxcclxuXHRcdFx0XHR4LFxyXG5cdFx0XHRcdHksXHJcblx0XHRcdFx0c3BlZWQsXHJcblx0XHRcdFx0bWF4VGltZSxcclxuXHRcdFx0XHRldmVudHMsXHJcblx0XHRcdFx0bW92ZURpc3RGcm9tVGFyZ2V0LFxyXG5cdFx0XHRcdG1vdmVEaXN0RnJvbVRhcmdldE9yaWdpbjogbW92ZURpc3RGcm9tVGFyZ2V0XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRnYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb1hZKGRpc3BsYXlPYmplY3QsIHgsIHksIHNwZWVkLCBtYXhUaW1lKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtb3ZlVG9PYmplY3Qob2JqZWN0c1RvTW92ZSwgZ2FtZSwgZGlzcGxheU9iamVjdCwgZGVzdGluYXRpb24sIHNwZWVkLCBtYXhUaW1lLCBldmVudHMpIHtcclxuXHRtb3ZlVG9YWShvYmplY3RzVG9Nb3ZlLCBnYW1lLCBkaXNwbGF5T2JqZWN0LCBkZXN0aW5hdGlvbi54LCBkZXN0aW5hdGlvbi55LCBzcGVlZCwgbWF4VGltZSwgZXZlbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN0b3BUb01vdmUob2JqZWN0c1RvTW92ZSwgZGlzcGxheU9iamVjdCkge1xyXG5cdGNvbnN0IG9iamVjdFRvTW92ZSA9IGZpbmRPYmplY3RUb01vdmUob2JqZWN0c1RvTW92ZSwgZGlzcGxheU9iamVjdCk7XHJcblx0aWYgKG9iamVjdFRvTW92ZSkge1xyXG5cdFx0aWYgKGlzTW92aW5nKG9iamVjdFRvTW92ZSkpIHtcclxuXHRcdFx0c3RvcE9iamVjdE1vdmVtZW50KG9iamVjdFRvTW92ZSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiJdfQ==
