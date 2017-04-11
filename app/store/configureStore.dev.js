import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';
import {compose, createStore} from 'redux';
import debounce from "redux-localstorage-debounce"
// import persistState from 'redux-localstorage'


import persistState, {mergePersistedState} from 'redux-localstorage';
import adapter from 'redux-localstorage/lib/adapters/localStorage';
// import filter from 'redux-localstorage-filter';

// const reducer = compose(
//   mergePersistedState()
// )(rootReducer);

const storage = compose(
  debounce(100),
//   filter('nested.key')
)(adapter(window.localStorage));

const enhancer = compose(
  DevTools.instrument(),
  /* applyMiddleware(...middlewares) */
  persistState(storage, 'todo')
);



// const store = createStore(/*reducer, [initialState]*/, enhancer)
export default function configureStore(initialState) {
    const store = createStore(
        rootReducer,
        initialState,
        // DevTools.instrument()
        enhancer
    );

    return store;
}
