const React = require('react');
const CodeMirror = require('react-codemirror');
require('codemirror/lib/codemirror.css');
const CM = React.createClass({
	getInitialState: function() {
		return {
			code: "// Code",
		};
	},
	updateCode: function(newCode) {
		this.setState({
			code: newCode,
		});
	},
	render: function() {
		var options = {
			lineNumbers: true,
		};
		return <CodeMirror value={this.state.code} onChange={this.updateCode} options={options} />
	}
});


export default CM;