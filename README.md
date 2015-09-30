# cycle-local-storage
Simple local storage driver for cycle.js

# Install
`npm install cycle-local-storage`

# Example Usage
```javascript
import localStorageDriver from 'cycle-local-storage';

const main = ({Storage}) => {
  ...

  Storage
    .get('key1')
    .map(value => console.log(value)) // value1

  ...

  let storage$ = Rx.Observable.just({
    "key1": "value1",
    "key2": "value2"
  }); // Observable object of key:value

  /*
  OR
  */

  storage$ = Rx.Observable.just([
    {"key1": "value1"},
    {"key2": "value2"}
  ]) // Observable array of objects

  return {
    Storage: storage$
  }
}

run(main, {
  Storage: localStorageDriver // is not a factory function
})
```
