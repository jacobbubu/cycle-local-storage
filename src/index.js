import Rx from 'rx';

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

const makeStorageSubject = () => {
  const storageSubject = new Rx.BehaviorSubject(localStorage);

  storageSubject.get = keys => {
    if (Array.isArray(keys)) {
      return storageSubject.map(store => {
        return keys.map(key => store.getItem(key) );
      });
    }
    return storageSubject.flatMap(store => {
      let value = store.getItem(keys)
      if (value === null) return Rx.Observable.empty()
      return Rx.Observable.just(value)
    })
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
