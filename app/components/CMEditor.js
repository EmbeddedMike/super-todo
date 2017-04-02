const React = require('react');
const CodeMirror = require('react-codemirror');
require('codemirror/lib/codemirror.css');
const CMEditor = React.createClass({
	getInitialState: function() {
		return {
			code: "// Codexxx",
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


export default CMEditor;