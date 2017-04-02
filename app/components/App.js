import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { footer } from '../styles/footer.scss';
import CMEditor from './CMEditor'
const App = ({ children }) =>
    <div>
        <CMEditor value={"VVVV"}> text here </CMEditor>
        <h1>Filtering </h1>
        { children }
        <footer className={footer}>
            <Link to="/">Filtering the Table</Link>
            <Link to="/about">About</Link>
        </footer>
    </div>;

App.propTypes = {
    children: PropTypes.object
};

export default App;
