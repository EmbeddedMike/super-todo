import React from 'react';
import { render } from 'react-dom';
import styles from "../css/main.css"
// It's important to not define HelloWorld component right in this file
// because in that case it will do full page reload on change
import HelloWorld from './HelloWorld.jsx';

render(<HelloWorld />, document.getElementById('root'));
