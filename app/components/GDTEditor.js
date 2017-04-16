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
	isSection(line) {
		return line.match(/^#*\s?(#|@)\s?(\w*)/);
	}
	findSectionOfLine(n) {
		let lastSection = ""
		let matcher;
		for (let i = 0; i < n; i++) {
			if (matcher = this.isSection(this.cm.getLine(i))) {
				lastSection = matcher[1][0] + matcher[2];
			}
		}
		return lastSection;
	}
	findSectionByName(sName) {
		const n = this.cm.lineCount()
		for (let i = 0; i < n; i++) {
			let matcher;
			if (matcher = this.isSection(this.cm.getLine(i))) {
				if ((matcher[1] + matcher[2]) === sName) {
					return i;
				}
			}
		}
		return -1;
	}
	getTags(sLine) {
		let regexp = /([#@]\w*)/gi;
		return sLine.match(regexp);
	}
	expandTags(tags) {
		let replaceable = {"#W": "#Waiting", 
		"#N":"#Next", 
		"#D": "#Done",
		"#X": "#Deleted", 
		"#P":"#Project",
		"@e": "@email",
		"@p": "@phone"}
		return tags.map(
			(tag) =>{
				return replaceable[tag] ? replaceable[tag] : tag;
			}
		)
	}
	deleteLine(nLine){
		this.cm.replaceRange("", {line:nLine, ch: 0}, {line: nLine + 1,ch: 0});
	}
	insertLine(nLine, sLine){
		this.cm.replaceRange(sLine + "\n", {line:nLine + 1, ch: 0})

	}
	moveLine( nLine, sRoot, currentSection, tags ){
		let nSection1 = this.findSectionByName(tags[0])
		let sLine = sRoot + " " + tags.join(" ")
		if(nSection1 === -1){
			tags[0] += "?"
			sLine = sRoot + " " + tags.join(" ")
			this.cm.replaceRange(sLine, {line:nLine, ch:0}, {line:nLine, ch: null})			
			this.cm.setCursor(nLine, sLine.length)
			return;
		}
		if(currentSection === "#IN"){
			this.deleteLine(nLine)
			if(nSection1 > nLine ) nSection1--;
			this.insertLine(nSection1, sLine )
		}
	}
	cursorActivity(cm) {
		let currentLine = cm.getCursor().line;
		if (currentLine === this.lastLine) return;

		let sLine = cm.getLine(this.lastLine);
		if (!this.isSection(sLine)) {
			let tags = this.getTags(sLine)
			if (tags && tags.length > 0) {
				let rootLine = (sLine.match(/(.*?)\s*[#@]/))[1]
				tags = this.expandTags(tags)
				let currentSection = this.findSectionOfLine(currentLine)
				this.moveLine(this.lastLine, rootLine, currentSection, tags)
			}
		}
		this.lastLine = currentLine;
	}
	addCB(event, cb) {
		let boundCB = cb.bind(this)
		this.cm.on(event, boundCB)
		this.callbacks.push({ event, boundCB })
	}
	initialize(cm) {
		if (!this.lastLine) this.lastLine = 0;
		if (!cm) return;
		if (!this.cm) this.cm = cm.getCodeMirror();
		for (let entry of this.callbacks) {
			this.cm.off(entry.event, entry.boundCB)
		}
		this.callbacks = []
		this.addCB("cursorActivity", this.cursorActivity)
		this.cm.removeKeyMap("GTD");
		this.cm.addKeyMap({
			name: "GTD",
			"Ctrl-S": (cm) => {
				this.props.editorAction("saveTodo");
				return false
			}
		})

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
			dispatch({ type: "editorAction", data: { op, data } })
			setTimeout(() => { dispatch({ type: "editorAction", data: { op: "idle" } }); }, 300)
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