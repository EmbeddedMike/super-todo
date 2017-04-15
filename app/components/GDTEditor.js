const React = require('react');
const CodeMirror = require('react-codemirror');
import SocketStatus from "./socketStatus";
require('codemirror/lib/codemirror.css');
require('codemirror/mode/gfm/gfm');
import { setUser } from "../actions/index.js"



class GDTEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = { code: "//Test" }
		this.callbacks = []

	}
	updateCode(newCode) {
		this.setState({
			code: newCode
		});
	}
	cursorActivity(cm) {
		console.log("Cursor did move")
	}
	addCB(event, cb){
		let boundCB = cb.bind(this)
		this.cm.on(event, boundCB)
		this.callbacks.push({event,boundCB})
	}
	initialize(cm) {
		if (!cm) return;
		if (!this.cm) this.cm = cm.getCodeMirror();
		for(let entry of this.callbacks){
			console.log("removed " + entry.event)
			this.cm.off(entry.event, entry.boundCB)
		}
		this.callbacks = []
		this.addCB("cursorActivity",this.cursorActivity)
		this.cm.removeKeyMap("GTD");
		this.cm.addKeyMap({
			name: "GTD",
			"Ctrl-S": (cm) => {this.props.editorAction("saveTodo");
			return false}
		})

	}

	componentDidMount() {
		console.log	("Did Mount")

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
		this.setState({ code: todos })
	}
	getTodo() {
		return this.cm.getValue();
	}
	render() {
		var options = {
			lineNumbers: true,
			mode: "gfm"
		};


		return (<div>
			<input
			ref={(input) => { this.textInput = input }}
				onKeyPress={this.checkEnter.bind(this)}
				onBlur={this.readTodos.bind(this)}
			/>
			<CodeMirror
				ref={(entry) => { this.initialize(entry) }}
				value={this.state.code}
				onChange={this.updateCode.bind(this)}
				options={options} />
			<SocketStatus
				returnTodo={this.returnTodo.bind(this)}
				getTodo={this.getTodo.bind(this)}

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
		},
		editorAction: (op, data) => {
			dispatch({type: "editorAction", data: {op, data}})
			setTimeout( () => {dispatch({type: "editorAction", data: {op: "idle"}});},300)
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