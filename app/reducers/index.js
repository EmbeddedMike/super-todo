import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';
const commandState = (state = [], action) => {
    switch (action.type) {
        case "test":
            console.log("newest reducer" , action.data, state.length)
            return [...state, action.data]
        default:
            return state
    }
    
}

const user = (state = '', action) => {
    // console.log("User Reducer", types, action)
    switch (action.type) {
        case types.SET_USER:
            return action.user;
        default:
            return state;
    }
};

const editorAction = (state = {}, action) => {
    switch (action.type) {
        case "editorAction":
            return action.data
        default:
            return state;
    }
}


const rootReducer = combineReducers({
    user,
    editorAction,
    commandState
});

export default rootReducer;
