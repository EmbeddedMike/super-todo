import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import GDTEditor from './components/GDTEditor';
import About from './components/About';

export default (
	<Route path="/" component={App}>
		<IndexRoute component={GDTEditor} />
		<Route path="/about" component={About} />
	</Route>
);
