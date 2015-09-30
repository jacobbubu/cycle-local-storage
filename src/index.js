import {Rx} from '@cycle/core';

const storeSetter = storageObject => {

  try {

    if (storageObject === undefined) return localStorage;

    if (typeof storageObject === 'object') {
      if (Object.keys(storageObject).length <=0 ) return localStorage;

      Object.keys(storageObject)
        .forEach(key => localStorage.setItem(key, storageObject[key]) );
    }

    if (Array.isArray(storageObject)) {
      if (storageObject.length <= 0) return localStorage;
      storageObject.map(storeSetter);
    }

  }

  catch (e) {
    throw new Error("Invalid input to localStorage Driver; received: " + typeof storageObject);
  } finally {
    return localStorage;
  }
}

const makeStorageSubject = () => {
  const storageSubject = new Rx.BehaviorSubject(localStorage);

  storageSubject.get = keys => {
    if (Array.isArray(keys)) {
      return storageSubject.map(store => {
        return keys.map(key => store.getItem(key) );
      });
    }
    return storageSubject.map( store => store.getItem(keys) )
  };

  storageSubject.getItem = storageSubject.get; // in case developer uses the localStorage api method name

  return storageSubject;
}

const localStorageDriver = storage$ => {

  const storageSubject = makeStorageSubject();

  storage$
    .distinctUntilChanged()
    .map(storeSetter)
    .subscribe(store => storageSubject.onNext(store));

  return storageSubject;
}


export default localStorageDriver;
export {localStorageDriver};
