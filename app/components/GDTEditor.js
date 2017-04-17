const React = require('react');
const CodeMirror = require('react-codemirror');
import SocketStatus from "./socketStatus";
require('codemirror/lib/codemirror.css');
require('codemirror/mode/gfm/gfm');
import { setUser } from "../actions/index.js"
const debounce = require("debounce")


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
		let matcher;
		if (matcher = line.match(/^#*\s?(#|@)\s?(\w*)/)) {
			return matcher[1][0] + matcher[2]
		}
		return false;

	}
	findSectionOfLine(n) {
		this.makeSectionTable();
		const keys = Object.keys(this.sectionTable);
		let lastSection = "NONE"
		for (const key of keys) {
			if (n < this.sectionTable[key]) return lastSection;
			lastSection = key;
		}
		return lastSection;

	}
	makeSectionTable() {
		if (this.sectionTable) return;
		this.sectionTable = {}
		const n = this.cm.lineCount()
		for (let i = 0; i < n; i++) {
			let sName;
			if (sName = this.isSection(this.cm.getLine(i))) {
				if (this.sectionTable[sName]) {
					console.log("Duplicate Section " + sName)
				} else {
					this.sectionTable[sName] = i;
				}
			}
		}
	}
	findSectionByName(sName) {
		this.makeSectionTable()
		return this.sectionTable[sName];
	}
	getTags(sLine) {
		let regexp = /[#@](\w*)(\?|!|$)?/gi;
		return sLine.match(regexp);
	}
	expandTags(tags) {
		let replaceable = {
			"#W": "#Waiting",
			"#N": "#Next",
			"#D": "#Done",
			"#X": "#Deleted",
			"#P": "#Projects",
			"@e": "@email",
			"@p": "@phone"
		}
		return tags.map(
			(tag) => {
				return replaceable[tag] ? replaceable[tag] : tag;
			}
		)
	}
	deleteLine(nLine) {
		this.cm.replaceRange("", { line: nLine, ch: 0 }, { line: nLine + 1, ch: 0 });
	}
	insertLine(nLine, sLine) {
		this.cm.replaceRange(sLine + "\n", { line: nLine + 1, ch: 0 })
	}

	validateTags(tags) {
		let sLine;
		let newTags = tags.map((tag) => {
			let tagSuffix = tag[tag.length - 1]
			if (tagSuffix === "?") return tag + "?";
			if (tagSuffix === "!") {
				tag = tag.slice(0, tag.length - 1);
				if (!this.findSectionByName(tag)) {
					let section;
					if (tag[0] === "@") {
						section = "#Next"
						sLine = "# " + tag
					} else {
						section = "#Projects"
						sLine = "# " + tag.slice(1)
					}
					let moveLoc = this.findSectionByName(section)
					this.insertLine(moveLoc, sLine)
				}
				return tag;
			}
			if (this.findSectionByName(tag)) return tag;
			return tag + "?"
		});
		return newTags
	}

	moveLineFromPositionToTag(sLine, nSource, sTag) {
		console.log("STAG", sTag)
		let nTag = this.findSectionByName(sTag)
		this.deleteLine(nSource)
		if (nTag > nSource) nTag--;
		console.log(nTag, sLine)
		//this.insertLine(nTag, sLine)

	}

	moveLine(nLine, sRoot, lineSection, tags) {
		let sTags = tags.join(" ");
		let sLine = sRoot + " " + sTags;
		if (sTags.indexOf("?") != -1) {
			this.cm.replaceRange(sLine, { line: nLine, ch: 0 }, { line: nLine, ch: null })
			this.cm.setCursor(nLine, sLine.indexOf('?') + 1)
			return;
		} else {
			let moveLocs = "#Done,#Waiting,#Next,#Someday".split(",");
			for( const loc in moveLocs){
				if(loc in tags){
					this.moveLineFromPositionToTag(sLine,nLine,loc)
					return
				}
			}
		}
	}
	diag(sLine){
	  this.insertLine(this.lastLine, sLine)
	}
	cursorActivity(cm) {
		// if(this.inLoop) return;
		this.inLoop = true;
		let currentLine = cm.getCursor().line;
		if (currentLine === this.lastLine) return;
		this.sectionTable = null;
		let sLine = cm.getLine(this.lastLine);
		if (!this.isSection(sLine)) {
			let tags = this.getTags(sLine)
			if (tags && tags.length > 0) {
				let rootLine = (sLine.match(/(.*?)\s*[#@]/))[1]
				tags = this.expandTags(tags)
				tags = this.validateTags(tags, this.lastLine);
				if(tags.join("").indexOf("?") != -1){
					this.insertLine(this.lastLine, "Still a '?'")
				}
				let lineSection = this.findSectionOfLine(this.lastLine)
				this.moveLine(this.lastLine, rootLine, lineSection, tags)
			}
		}
		this.lastLine = currentLine;
		this.inLoop = false;
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
		this.addCB("cursorActivity", debounce(this.cursorActivity,2000,true))
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