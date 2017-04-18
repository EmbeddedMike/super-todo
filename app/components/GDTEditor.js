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
	isSection(line) {
		let matcher;
		if (matcher = line.match(/^#*\s?(#|@)\s?(\w*)\s*(\/\/|$)/)) {
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
				sName = sName.toLowerCase()
				if (this.sectionTable[sName]) {
					console.log("Duplicate Section " + sName)
				} else {
					this.sectionTable[sName] = i;
				}
			}
		}
	}
	findSectionByName(sName) {
		sName = sName.toLowerCase()
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
	adjustSectionTable(nLine, diff){
		for(section in this.sectionTable){
			if(this.sectionTable[section] > nLine){
				this.sectionTable[section] += diff;
			}
		}
	}
	deleteLine(nLine) {
		this.cm.replaceRange("", { line: nLine, ch: 0 }, { line: nLine + 1, ch: 0 });
		this.adjustSectionTable(nLine, -1)
	}
	insertLine(nLine, sLine) {
		this.cm.replaceRange(sLine + "\n", { line: nLine + 1, ch: 0 })
		this.adjustSectionTable(nLine, +1)
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
		let nTag = this.findSectionByName(sTag)
		this.deleteLine(nSource)
		if (nTag > nSource) nTag--;
		this.insertLine(nTag, sLine)

	}

	moveLine(nLine, sRoot, tags) {
		
		let sLine = sRoot + " " + tags.join(" ");
		let moveLocs = "#Done,#Waiting,#Next,#Someday".split(",");
		for (const loc of moveLocs) {
			if (tags.indexOf(loc) != -1) {
				// this.diag("LOC is " + loc)
				this.moveLineFromPositionToTag(sLine, nLine, loc)
				return
			}
		}
        let sLastSection = this.findSectionOfLine(this.lastLine)

	}
	diag(sLine) {
		this.insertLine(this.lastLine, sLine)
	}
	trace(inargs){
		try{
			throw new Error()
		} catch (e){
			console.clear()
			const sMethodLine = e.stack.split("\n")[3]
			const sMethod = sMethodLine.match(/\.(\S*)/)[1]
			const body = this[sMethod].toString().substring(0,50)
			const args = body.match(/\((.*)\)/)[1].split(",")
			for(let i = 0; i< args.length; i++){
				console.log(args[i] + " = " + inargs[i])
			}
			
		}
	}
	getRootLine(sLine){
		if(sLine.match(/^[@#]/)){
			return sLine[0] + sLine.substring(1).match(/^(.*?)([#@]\w*\s*)*$/)[1]
		} else {
			return sLine.match(/^(.*?)([#@]\w*\s*)*$/)[1]
		}
	}
	cursorActivity(cm,xxy) {
		// console.log(this.cursorActivity + "")
		this.trace(arguments)
		let currentLine = cm.getCursor().line;
		if (currentLine === this.lastLine) return;
		this.sectionTable = null;
		let sLine = cm.getLine(this.lastLine);
		if (!this.isSection(sLine)) {
			let tags = this.getTags(sLine);
			if (tags && tags.length > 0) {
				let rootLine = this.getRootLine(sLine)
				// this.diag("ROOT " + rootLine)
				// this.diag("tags " + tags.join(","))
				tags = this.expandTags(tags)
				tags = this.validateTags(tags, this.lastLine);
				if (tags.join("").indexOf("?") === -1) {
					// this.diag("TAGZ " + tags.join("!"))
					this.moveLine(this.lastLine, rootLine, tags)
				}
				
			}
		}
		this.lastLine = currentLine;
		
	}
	addCB(event, cb) {
		let boundCB = cb.bind(this)
		this.cm.on(event, boundCB)
		this.callbacks.push({ event, boundCB });
	}
	disposeHandler(){
		console.log("I am disposed again!!! here!!")
	}
	initialize(cm) {
		if (!this.lastLine) this.lastLine = 0;
		if (!cm) return;
		this.cm = cm.getCodeMirror();
		if(module.hot){
			module.hot.addDisposeHandler(this.disposeHandler.bind(this))
		}	// if(moduleInitialized) return;
		
	
		for (let entry of this.callbacks) {
			this.cm.off(entry.event, entry.boundCB)
		}
		this.callbacks = []
		this.addCB("cursorActivity", debounce(this.cursorActivity, 50, true))
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
		this.cm.setValue(todos)
	}
	getTodo() {
		return this.cm.getValue();
	}
	render() {
		console.log("render")
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
// check if HMR is enabled
