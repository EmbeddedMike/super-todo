import React from 'react';
import PropTypes from 'prop-types'
import { Link } from 'react-router';
import { footer } from '../styles/footer.scss';
import GDTEditor from './GDTEditor'

const App = ({ children }) =>
    <div>
       
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
