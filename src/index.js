import {Rx} from '@cycle/core';

const handleStorageObjectAsObject = storageObject => {
  // Avoid querying object more than once.
  const storageObjectKeys = Object.keys(storageObject);

  if (storageObjectKeys.length <=0 ) return localStorage;

  storageObjectKeys
    .forEach(key => localStorage.setItem(key, storageObject[key]) );

  return localStorage;
}

const handleStorageObjectAsArray = storageObject => {
  if (storageObject.length <= 0) return localStorage;
  storageObject.map(storeSetter);

  return localStorage;
}

const storeSetter = storageObject => {
  try {
    if (storageObject === undefined) return localStorage;

    if (typeof storageObject === 'object') {
      return handleStorageObjectAsObject(storageObject);
    }

    if (Array.isArray(storageObject)) {
      return handleStorageObjectAsArray(storageObject);
    }
  }
  catch (e) {
    throw new Error("Invalid input to localStorage Driver; received: " + typeof storageObject);
  } finally {
    return localStorage;
  }
}

function getKey(key) {
  return localStorage.getItem(key)
}

const makeStorage$ = () => {
  const storage$ = Rx.Observable.just(localStorage);

  storage$.get = keys => {

    if (Array.isArray(keys)) {
      return Rx.Observable.create(observer => {
        return keys.map(key => getKey(key));
      });
    }

    return Rx.Observable.just(getKey(keys))
      .flatMap(value => {
        if (value === null) return Rx.Observable.empty()
        return Rx.Observable.just(value)
      });
  };

  storage$.getItem = storage$.get; // in case developer uses the localStorage api method name

  return storage$;
}

const localStorageDriver = keys$ => {

  const storage$ = makeStorage$();

  keys$
    .distinctUntilChanged()
    .map(storeSetter)
    .subscribe();

  return storage$;
}


export default localStorageDriver;
export {localStorageDriver};
