const React = require('react');
const CodeMirror = require('react-codemirror');
require('codemirror/lib/codemirror.css');
class CMEditor extends React.Component{
	constructor(props) {
		super(props);
		this.state = {code: "//Test"}
		
	}
	updateCode(newCode) {
		this.setState({
			code: newCode,
		});
	}
	componentDidMount(){
		console.log("Did Mount")
	}
	componentWillUnMount(){
		console.log("Unmounting")
	}
	render() {
		var options = {
			lineNumbers: true,
		};
		console.log("Render")
		return <CodeMirror value={this.state.code} onChange={this.updateCode.bind(this)} options={options} />
	}
};


export default CMEditor;