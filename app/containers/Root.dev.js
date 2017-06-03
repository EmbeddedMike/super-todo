import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { Provider } from 'react-redux';
import DevTools from './DevTools';
import { Router } from 'react-router';
import GDTEditor from '../components/GDTEditor';
import CodeEditor from '../components/CodeEditor'
export default class Root extends Component {
    render() {
        const { store } = this.props;
        return (
            <Provider store={store}>

                <div>
                    <div className="gdtContainer" >
                        <CodeEditor className="gdtCode" />
                        <GDTEditor />
                    </div>
                    <DevTools />
                </div>
            </Provider>
        );
    }
}

Root.propTypes = {
    store: PropTypes.object.isRequired,
};
