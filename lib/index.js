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

var makeStorageSubject = function makeStorageSubject() {
  var storageSubject = new _cycleCore.Rx.BehaviorSubject(localStorage);

  storageSubject.get = function (keys) {
    if (Array.isArray(keys)) {
      return storageSubject.map(function (store) {
        return keys.map(function (key) {
          return store.getItem(key);
        });
      });
    }
    return storageSubject.flatMap(function (store) {
      var value = store.getItem(keys);
      if (value === null) return _cycleCore.Rx.Observable.empty();
      return _cycleCore.Rx.Observable.just(value);
    });
  };

  storageSubject.getItem = storageSubject.get; // in case developer uses the localStorage api method name

  return storageSubject;
};

var localStorageDriver = function localStorageDriver(storage$) {

  var storageSubject = makeStorageSubject();

  storage$.distinctUntilChanged().map(storeSetter).subscribe(function (store) {
    return storageSubject.onNext(store);
  });

  return storageSubject;
};

exports['default'] = localStorageDriver;
exports.localStorageDriver = localStorageDriver;