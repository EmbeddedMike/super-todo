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
			id: ""
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
			this.readTodos()
		}
	}
	setInput(e){
		console.log(e)
	}
	readTodos() {
		this.setState({id: this.textInput.value})
	}
	render() {
		var options = {
			lineNumbers: true,
		};
			// onBlur={this.readTodos.bind(this)}
		
		console.log("Rendered once more!!!" + this.state.id)
	
		return (<div>
			<input
			ref={(input)=>{this.textInput=input}}
			onKeyPress={this.checkEnter.bind(this)}
			onBlur={this.readTodos.bind(this)}
			/>
		<CodeMirror value={this.state.code} onChange={this.updateCode.bind(this)} options={options} />
        <SocketStatus 
		id={this.state.id}
		
		/>
		</div>)
	}
};


export default GDTEditor;