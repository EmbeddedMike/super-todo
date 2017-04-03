import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';
import {compose, createStore} from 'redux';
import persistState from 'redux-localstorage'
const config = {
    key: "todo"
};
const enhancer = compose(
  DevTools.instrument(),
  persistState(undefined, config),
)

// const store = createStore(/*reducer, [initialState]*/, enhancer)
export default function configureStore(initialState) {
    const store = createStore(
        rootReducer,
        initialState,
        enhancer
    );

    return store;
}
