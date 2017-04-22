const React = require('react'); //feature: react
const CodeMirror = require('react-codemirror');
import SocketStatus from "./socketStatus";
const BaseCodeMirror = require('codemirror/lib/codemirror')
require('codemirror/addon/dialog/dialog')
require('codemirror/addon/search/searchcursor')
require('codemirror/addon/search/search')
require('codemirror/keymap/sublime')
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/addon/search/matchesonscrollbar');
require('codemirror/addon/search/matchesonscrollbar.css');
require('codemirror/lib/codemirror.css');
require('codemirror/addon/mode/simple');
require('codemirror/mode/gfm/gfm');
require("codemirror/addon/dialog/dialog.css");
require('codemirror/addon/search/jump-to-line')
require('codemirror/addon/search/match-highlighter')
require('codemirror/addon/fold/foldcode')
require('codemirror/addon/fold/foldgutter')
require('codemirror/addon/fold/foldgutter.css')
require('codemirror/addon/fold/indent-fold')

require('../css/gtdflow.css')
import { setUser } from "../actions/index.js"
const debounce = require("debounce")


class GDTEditor extends React.Component {
	//F: initialize
	constructor(props) {
		super(props);
		this.state = { code: "//Test" }
		this.callbacks = []

	}
	//F: sections, helpers
	isSectionTest() {
		let tests = {
			"# test something": "#test"
			, "## test something else": "#test"
			, "## @test another": "@test"
			, "## @@test another": false
			, "Just stuff": false
		};
		for (key of tests) {
			if (isSection(key) != tests[key]) {
				console.log(`Failed ${key}=>${isSection(key)} is not ${tests[key]}`)
			}
		}
	}
	isSection(line) {
		let matcher;
		if (matcher = line.match(/^\s*#*\s?([@#])\s?(\w*)\s*(\/\/|$)/)) {
			return matcher[1][0] + matcher[2]
		}
		return false;
	}
	//F: sections, helpers
	findSectionOfLine(n) {
		this.makeSectionTable();
		const keys = Object.keys(this.sectionTable);
		let lastSection = "#IN"
		for (const key of keys) {
			if (n < this.sectionTable[key]) return lastSection;
			lastSection = key;
		}
		return lastSection;

	}
	//F: sections, helpers
	makeSectionTable() {
		this.tracePush(false)
		if (this.sectionTable) return;
		const n = this.cm.lineCount()
		this.sectionTable = {}
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
		this.tracePop()
	}
	//F: sections, helpers
	findSectionByName(sName) {
		sName = sName.toLowerCase()
		this.makeSectionTable()
		return this.sectionTable[sName];
	}
	//F: sections, helpers
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
	adjustSectionTable(nLine, diff) {
		for (const section in this.sectionTable) {
			if (this.sectionTable[section] > nLine) {
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
	removeDuplicates(tags) {
		let result = [];
		tags.forEach((item) => {
			if (result.indexOf(item) < 0) {
				result.push(item);
			}
		});
		return result;
	}

	validateTags(tags) {
		let sLine;
		tags = this.removeDuplicates(tags)
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
					this.sectionTable[tag] = moveLoc;
				}
				return tag;
			}
			if (this.findSectionByName(tag)) return tag;
			return tag + "?"
		});
		return newTags
	}

	moveLineFromPositionToTag(sLine, nSource, sTag) {
		//ehcek to see if already there
		if (this.findSectionOfLine(nSource) === sTag) return;
		let nTag = this.findSectionByName(sTag)
		if (nTag) {
			this.deleteLine(nSource)
			if (nTag > nSource) nTag--;
			this.insertLine(nTag, sLine)
		}

	}

	moveLine(nLine, sRoot, tags) {

		let sLine = sRoot.trim().replace(/ +/g, ' ') + " " + tags.join(" ");
		let moveLocs = "#Done,#Waiting,#Next,#Someday".split(",");
		for (const loc of moveLocs) {
			if (tags.indexOf(loc) != -1) {
				// this.diag("LOC is " + loc)
				this.moveLineFromPositionToTag(sLine, nLine, loc)
				return
			}
		}

		let tag = tags[0]
		this.moveLineFromPositionToTag(sLine, nLine, tag)
	}
	diag(sLine) {
		this.insertLine(this.lastLine, sLine)
	}
	unTrace(name) {
		delete this[name]
	}

	makeTrace(name) {
		if (!this[name] || typeof this[name] != "function") {
			console.log("undefined fn" + name)
			return;
		}
		this.unTrace(name)
		const body = this[name].toString().substring(0, 80)
		const args = body.match(/\((.*)\)/)[1].split(",")
		let tracedFn = (...tracedArgs) => {
			this.traceDepth++
			let results = []
			for (let i = 0; i < args.length; i++) {
				results.push(args[i] + "=" + tracedArgs[i])
			}
			let spaces = new Array(this.traceDepth - 1).join("..")
			this.traceEnter(spaces + `called ${name} (` + results.join(", ") + ")")
			let result = this[name].original(...tracedArgs)
			this.traceExit(spaces + "returned " + result + " from " + name)
			this.traceDepth--;
			return result;
		}
		tracedFn = tracedFn.bind(this)
		tracedFn.original = this[name].bind(this);
		this.tracedFns.push(name)
		this[name] = tracedFn;
	}
	tracePush(enable) {
		this.traceStack.push(this.traceOutput)
		this.traceOutput = enable
		this.tracePrint(undefined)
	}

	tracePop() {
		this.traceOutput = this.traceStack.pop()
		if (!this.TraceOutput) this.traceBuffer = undefined;
	}
	traceClear() {
		this.skipTrace = true
	}
	traceEnter(s) {
		this.traceBuffer = s;
	}
	traceExit(s) {
		if (this.skipTrace) {
			this.traceBuffer = undefined;
			this.skipTrace = false
		}
		else this.tracePrint(s)
	}
	tracePrint(string) {
		if (this.traceOutput && this.traceBuffer) {
			console.log(this.traceBuffer)
			this.traceBuffer = undefined
		}
		if (this.traceOutput) this.traceBuffer = string
	}
	unTraceAll() {
		this.traceDepth = 0;
		this.traceStack = []
		this.traceOutput = true
		if (!this.tracedFns) this.tracedFns = []
		for (const name of this.tracedFns) {
			this.unTrace(name)
		}
	}
	trace(inargs) {
		try {
			throw new Error()
		} catch (e) {
			const sMethodLine = e.stack.split("\n")[3]
			const sMethod = sMethodLine.match(/\.(\S*)/)[1]
			const body = this[sMethod].toString().substring(0, 50)
			const args = body.match(/\((.*)\)/)[1].split(",")
			for (let i = 0; i < args.length; i++) {
				console.log(args[i] + " = " + inargs[i])
			}

		}
	}
	getRootLine(sLine) {
		if (sLine.match(/^[@#]/)) {
			return sLine[0] + sLine.substring(1).match(/^(.*?)([#@]\w*\s*)*$/)[1]
		} else {
			return sLine.match(/^(.*?)([#@][\w!\?]+\s*)*$/)[1]
		}
	}
	cursorActivity(cm) {
		// console.log(this.cursorActivity + "")
		// let makeTrace = (fn) =>
		// 	() trace()
		// this.trace(arguments)
		let currentLine = cm.getCursor().line;
		if (currentLine === this.lastLine) {
			this.traceClear()
			return;
		}
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
					console.log(rootLine)
					this.moveLine(this.lastLine, rootLine, tags)
				} else {
					sLine = rootLine + tags.join(" ")
					this.cm.replaceRange(sLine,
						{ line: this.lastLine, ch: 0 },
						{ line: this.lastLine, ch: null })
					this.cm.setCursor({ line: this.lastLine, ch: sLine.indexOf("?") + 1 })
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
	disposeHandler() {
		console.clear()
		console.log("I am disposed again!!! here!!")
		this.unTraceAll()
	}
	initialize(cm) {
		if (!this.lastLine) this.lastLine = 0;
		if (!cm) return;
		this.cm = cm.getCodeMirror();
		// this.cm.setOption("fold", this.cm.constructor.fold.indent)
		if (module.hot) {
			module.hot.addDisposeHandler(this.disposeHandler.bind(this))
		}	// if(moduleInitialized) return;
		this.unTraceAll()
		this.makeTrace("cursorActivity")
		this.makeTrace("isSection")
		this.makeTrace("expandTags")
		this.makeTrace("getRootLine")
		this.makeTrace("validateTags")
		this.makeTrace("moveLine")
		this.makeTrace("removeDuplicates")

		this.sectionTable = null
		this.makeSectionTable();


		for (let entry of this.callbacks) {
			this.cm.off(entry.event, entry.boundCB)
		}
		this.callbacks = []
		this.addCB("cursorActivity", debounce(this.cursorActivity, 50, true))
		this.cm.removeKeyMap("GTD");
		this.cm.addKeyMap({
			name: "GTD",
			"Alt-F": "findPersistent",
			"Ctrl-S": (cm) => {
				const startConfig = this.findSectionByName("#configstart");
				const endConfig = this.findSectionByName("#configend");
				// this.cm.setOption("mode", "gfm")
				if (startConfig >= 0 && endConfig) {
					this.config = this.cm.getRange({ line: startConfig + 1, ch: 0 }, { line: endConfig - 1, ch: null })
					try {
						eval(this.config)
					} catch (e) {
						console.log(e)
					}
					cm.setOption("mode", "simplemode")
				}
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
		// this.setState({ user: this.textInput.value });
		this.props.setUser(this.textInput.value);
	}
	returnTodo(todos) {
		this.cm.setValue(todos)
	}
	getTodo() {
		return this.cm.getValue();
	}
	render() {
		if (this.cm) console.log(this.cm.constructor)
		var options = {
			lineNumbers: true,
			extraKeys: {},
			keyMap: "sublime",
			extraKeys: {
				"Ctrl-Q": function (cm) {
					cm.foldCode(cm.getCursor());
				}
			},
			foldGutter: true,
			fold: "indent",
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
		};


		return (<div >
			<input
				ref={(input) => { this.textInput = input }}
				onKeyPress={this.checkEnter.bind(this)}
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
