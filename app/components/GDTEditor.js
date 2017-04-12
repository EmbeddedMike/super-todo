const React = require('react');
const CodeMirror = require('react-codemirror');
import SocketStatus from "./socketStatus";
require('codemirror/lib/codemirror.css');
require('codemirror/mode/markdown/markdown');
import { setUser } from "../actions/index.js"



class GDTEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = { code: "//Test" }

	}
	updateCode(newCode) {
		this.setState({
			code: newCode
		});
	}
	componentDidMount() {
		console.log("Did Mount")
		
		this.textInput.value = this.props.user;
	}
	
	checkEnter(e) {
		if (e.which === 13) {
			this.readTodos()
		}
	}

	readTodos() {
		this.setState({ user: this.textInput.value });
		this.props.setUser(this.textInput.value);
	}
	returnTodo(todos) {
		console.log("RETURN")
		this.setState({ code: todos })
	}
	render() {
		var options = {
			lineNumbers: true,
			mode: "markdown"
		};
	

		return (<div>
			<input
				ref={(input) => { this.textInput = input }}
				onKeyPress={this.checkEnter.bind(this)}
				onBlur={this.readTodos.bind(this)}
			/>
			<CodeMirror value={this.state.code} onChange={this.updateCode.bind(this)} options={options} />
			<SocketStatus
				returnTodo={this.returnTodo.bind(this)}

			/>
		</div>)
	}
};

import { connect } from "react-redux";
const mapDispatchToProps = (dispatch, ownProps) => {
	// return{}
	return {
		setUser: (name) => {
			dispatch(setUser(name))
		}
	}
}
const mapStateToProps = (state, ownProps) => {
  return { user: state.user }
}
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(GDTEditor);