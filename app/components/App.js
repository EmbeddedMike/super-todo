import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { footer } from '../styles/footer.scss';
import GDTEditor from './GDTEditor'
import SocketStatus from "./socketStatus";
const App = ({ children }) =>
    <div>
       
        { children }
        <footer className={footer}>
            <Link to="/">Filtering the Table</Link>
            <Link to="/about">About</Link>
        </footer>
        <SocketStatus/>
    </div>;

App.propTypes = {
    children: PropTypes.object
};

export default App;
