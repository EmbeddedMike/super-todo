import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';
import { compose, createStore } from 'redux';
// import persistState from 'redux-localstorage'
import throttle from 'lodash/throttle';


import { loadState, saveState } from './localStorage';
export default function configureStore() {

const persistedState = loadState();
  const store = createStore(
    rootReducer,
    persistedState,
    DevTools.instrument()
    
  );
  // if (module.hot) {
  //   // Enable Webpack hot module replacement for reducers
  //   module.hot.accept('../reducers', () => {
  //     const nextReducer = require('../reducers').default;
  //     store.replaceReducer(nextReducer);
  //   });
  // }
  store.subscribe(throttle(() => {
    saveState(store.getState());
  }, 1000));

  return store;
}
