import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import CMEditor from './components/CMEditor';
import About from './components/About';

export default (
	<Route path="/" component={App}>
		<IndexRoute component={CMEditor} />
		<Route path="/about" component={About} />
	</Route>
);
