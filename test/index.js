import {Rx} from '@cycle/core';
import {localStorageDriver} from '../src';
import test from 'tape';

const createData = () => {
  return Object.freeze({
    key1: 'value1',
    key2: 'value2',
    key3: 'value3',
    key4: 'value4'
  });
}

const createArray = () => {
  return [
    {key1: 'value1'},
    {key2: 'value2'},
    {key3: 'value3'},
    {key4: 'value4'}
  ];
};

test('localStorageDriver', t => {

  const possibleValues = new Map([
    ['an empty Observable', Rx.Observable.just()],
    ['an observable with empty object', Rx.Observable.just({})],
    ['an observable object with multiple keys/values', Rx.Observable.just(createData())],
    ['an empty observable array', Rx.Observable.just([])],
    ['an observable array of object', Rx.Observable.just(createArray())],
  ]);

  possibleValues.forEach((value, key) => t.ok(
    localStorageDriver(value), `should accept ${key} as input`
  ));

  const impossibleValues = new Map([
    ['an observable string', Rx.Observable.just('hello') ],
    ['an observable number', Rx.Observable.just(1)],
    ['an observable interval', Rx.Observable.interval(1000)],
    ['an observable array of arrays', Rx.Observable.just([ ['key1', 'value1'], ['key2', 'value2'] ]) ],
  ]);

  impossibleValues.forEach((value, key) => t.throws(localStorageDriver(value), Error, `should NOT accept ${key} as input`));

  t.ok(localStorageDriver(Rx.Observable.just(createData())) instanceof Rx.Observable, 'should return a Rx.Observable');

  localStorageDriver(Rx.Observable.just(createData()))
    .get('key1')
    .subscribe(value => {
      t.equal(value, 'value1', 'giving .get() a single key should return a single value');
    });

  localStorageDriver(Rx.Observable.just(createData()))
    .get(['key1', 'key2', 'key3', 'key4'])
    .subscribe(value => {
      t.ok(Array.isArray(value), `giving .get() an array of keys should return an array of values`);
    });

  localStorageDriver(Rx.Observable.just(createData()))
    .get('key5')
    .defaultIfEmpty('value5')
    .subscribe(value => {
      t.equal(value, 'value5', 'should be able to use defulatIfEmpty(value)')
    });

  t.end();
});
