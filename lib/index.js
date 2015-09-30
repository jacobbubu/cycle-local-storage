'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _cycleCore = require('@cycle/core');

var storeSetter = function storeSetter(storageObject) {

  try {

    if (storageObject === undefined) return localStorage;

    if (typeof storageObject === 'object') {
      if (Object.keys(storageObject).length <= 0) return localStorage;

      Object.keys(storageObject).forEach(function (key) {
        return localStorage.setItem(key, storageObject[key]);
      });
    }

    if (Array.isArray(storageObject)) {
      if (storageObject.length <= 0) return localStorage;
      storageObject.map(storeSetter);
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
        var _values = [];
        keys.forEach(function (key) {
          return _values.push(store.getItem(key));
        });
        return _values;
      });
    }
    return storageSubject.map(function (store) {
      return store.getItem(keys);
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