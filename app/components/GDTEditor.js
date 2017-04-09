const React = require('react');
const CodeMirror = require('react-codemirror');
import SocketStatus from "./socketStatus";
require('codemirror/lib/codemirror.css');


class GDTEditor extends React.Component{
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
	testFunction() {
		console.log("TESTed")
	}
	checkEnter(e) {
		if(e.which === 13 ){
			this.setState({code: this.state.code + "XX"})
			this.readTodos()
		}
	}
	setInput(e){
		console.log(e)
	}
	readTodos() {
		console.log("READing " + this.textInput.value)
	}
	render() {
		var options = {
			lineNumbers: true,
		};
			// onBlur={this.readTodos.bind(this)}
		
		console.log("Rendered once more!!!")
	
		return (<div>
			<input
			ref={(input)=>{this.textInput=input}}
			onKeyPress={this.checkEnter.bind(this)}
			onBlur={this.readTodos.bind(this)}
			/>
		<CodeMirror value={this.state.code} onChange={this.updateCode.bind(this)} options={options} />
        <SocketStatus 
		
		/>
		</div>)
	}
};


export default GDTEditor;