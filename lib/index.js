'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _cycleCore = require('@cycle/core');

var handleStorageObjectAsObject = function handleStorageObjectAsObject(storageObject) {
  // Avoid querying object more than once.
  var storageObjectKeys = Object.keys(storageObject);

  if (storageObjectKeys.length <= 0) return localStorage;

  storageObjectKeys.forEach(function (key) {
    return localStorage.setItem(key, storageObject[key]);
  });

  return localStorage;
};

var handleStorageObjectAsArray = function handleStorageObjectAsArray(storageObject) {
  if (storageObject.length <= 0) return localStorage;
  storageObject.map(storeSetter);

  return localStorage;
};

var storeSetter = function storeSetter(storageObject) {
  try {
    if (storageObject === undefined) return localStorage;

    if (typeof storageObject === 'object') {
      return handleStorageObjectAsObject(storageObject);
    }

    if (Array.isArray(storageObject)) {
      return handleStorageObjectAsArray(storageObject);
    }
  } catch (e) {
    throw new Error("Invalid input to localStorage Driver; received: " + typeof storageObject);
  } finally {
    return localStorage;
  }
};

function getKey(key) {
  return localStorage.getItem(key);
}

var makeStorage$ = function makeStorage$() {
  var storage$ = _cycleCore.Rx.Observable.just(localStorage);

  storage$.get = function (keys) {

    if (Array.isArray(keys)) {
      return _cycleCore.Rx.Observable.create(function (observer) {
        return keys.map(function (key) {
          return getKey(key);
        });
      });
    }

    return _cycleCore.Rx.Observable.just(getKey(keys)).flatMap(function (value) {
      if (value === null) return _cycleCore.Rx.Observable.empty();
      return _cycleCore.Rx.Observable.just(value);
    });
  };

  storage$.getItem = storage$.get; // in case developer uses the localStorage api method name

  return storage$;
};

var localStorageDriver = function localStorageDriver(keys$) {

  var storage$ = makeStorage$();

  keys$.distinctUntilChanged().map(storeSetter).subscribe();

  return storage$;
};

exports['default'] = localStorageDriver;
exports.localStorageDriver = localStorageDriver;