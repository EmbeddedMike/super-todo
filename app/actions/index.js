import * as types from './types';

export function filterTable(filter) {
    return {
        type: types.FILTER,
            filter
        };
}
export function setUser(user) {
    return {
        type: types.SET_USER,
        user
    };
}
export function setTodo(todos) {
    return {
        type: types.SET_TODOS,
        todos
    };
}