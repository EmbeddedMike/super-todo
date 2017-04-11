import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

const filter = (state = '', action) => {
    // console.log("FILTER REDUCER")
    switch (action.type) {
        case types.FILTER:
            return action.filter;
        default:
            return state;
    }
};
const user = (state = '', action) => {
    // console.log("User Reducer", types, action)
    switch (action.type) {
        case types.SET_USER:
            return action.user;
        default:
            return state;
    }
};
const todos = (state = '', action) => {
    switch (action.type) {
        case types.SET_TODOS:
            return action.todos;
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    filter,
    user,
    todos,
    routing
});

export default rootReducer;
