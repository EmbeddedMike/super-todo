const React = require('react'); //feature: react
const CodeMirror = require('react-codemirror');
import SocketStatus from "./socketStatus";
const Babel = require("babel-standalone")
const BaseCodeMirror = require('codemirror/lib/codemirror')
require('codemirror/addon/dialog/dialog')
require('codemirror/addon/search/searchcursor')
require('codemirror/addon/search/search')
let SourceMap = require("source-map")
require('codemirror/keymap/sublime')
import throttle from 'lodash/throttle';
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/addon/search/matchesonscrollbar');
require('codemirror/addon/search/matchesonscrollbar.css');
require('codemirror/lib/codemirror.css');
require('codemirror/addon/mode/simple');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/mode/multiplex');
require("codemirror/addon/dialog/dialog.css");
require('codemirror/addon/search/jump-to-line')
require('codemirror/addon/search/match-highlighter')
require('codemirror/addon/fold/foldcode')
require('codemirror/addon/fold/foldgutter')
require('codemirror/addon/fold/foldgutter.css')
require('codemirror/addon/fold/indent-fold')
require('codemirror/addon/hint/show-hint')
require('codemirror/addon/hint/javascript-hint')
require('codemirror/addon/hint/anyword-hint')
require('../css/gtdflow.css')
import CMLogger from '../js/cmlogger'
import Changer from "../js/syncchanges"
import { setUser } from "../actions/index.js"
const debounce = require("debounce")

window.onbeforeunload = function() {
  return "Are you sure you want to navigate away?";
}
class CodeEditor extends React.Component {
    //F: initialize
    constructor(props) {
        super(props);
        this.state = { code: "//Test" }
        this.callbacks = []

    }
    addCB(event, cb) {
        let boundCB = cb.bind(this)
        this.cm.on(event, boundCB)
        this.callbacks.push({ event, boundCB });
    }
    onChange(cm) {
        this.modChange(cm)
    }
    // debouncedCompile = debounce((cm) =>
    //     this.compileCode(cm), 100);
    // modChange = debounce((cm) => {
    //     this.cm.Logger.clearLogs()
    //     this.debouncedCompile(cm)
    //     //setTimeout( this.clearError.bind(this), 2000)
    // }, 50, false)

    showError(e) {
        let eLine = e.stack.split("\n")[0];
        console.log(eLine);
        let matcher = eLine.match(/^(.*):\s(.*):(.*)\((\d+):(\d+)/)
        if (matcher) {
            let message = matcher[1] + " " + matcher[3]
            let line = +matcher[4]
            line = line - 1
            let ch = +matcher[5]
            message = "<pre>" + Array(ch).join(" ") + "^ </pre>" + message
            this.cm.Logger.logAtPos({ line, ch: 0 }, message, "errormessage")
        } else {
            this.cm.Logger.logAtPos(this.cm.getCursor(), eLine, "errormessage")
        }
    }
    cursorActivity(cm) {
        this.actuallyMoved(cm)
    }
    actuallyMoved(cm) {
        //console.log("actually moved")
    }
    adjustSource(source) {
        return source
    }
    simpleAdjustSource(source) {
        return source
    }
    oldAdjustSource = true
    saveCode(cm) {
        console.log("this")
        try{
        this.changer = new Changer(cm)
        this.debouncedCompile = debounce((cm) =>
            this.compileCode(cm),800);
        this.modChange = debounce((cm) => {
            this.cm.Logger.clearLogs()
            this.changer.syncChanges(cm)
            this.debouncedCompile(cm)
            //setTimeout( this.clearError.bind(this), 2000)
        }, 300, false)
        if (!this.oldAdjustSource) {
            this.adjustSource = this.simpleAdjustSource
            console.log("restored")
            this.oldAdjustSource = !this.oldAdjustSource
            return;
        }
        this.oldAdjustSource = !this.oldAdjustSource
        this.compileCode(cm)
        }catch(e){
            console.log(e)
        }
    }

    compileCode(cm) {
        let source = this.cm.getValue();
        let aLines = source.split("\n")
        let n = aLines.length
        let sTop = ""
        let sBottom = ""
        let i = 0;
        let aSplit = (i, n) => {
            let aGroup = []
            for (; i < n; i++) {
                let line = aLines[i]
                if (line.match(/\/\/\s*SPLIT/)) {
                    break
                }
                aGroup[i] = line
            }
            return [i, aGroup.join("\n")]
        }
        [i, sTop] = aSplit(0, n)
        let offset = i + 1
        let result = [i, sBottom] = aSplit(offset, n)
//        source = this.adjustSource(source)
        this.compileAndRun(sTop, 0, true)
        this.compileAndRun(sBottom,0, false)
    }
    compileAndRun(source,offset,initial){
        source = "(exported) => {\n" + source + "}"
        try {
            // let func = "(param)=> {" + source + "}"
            let func = `
                    (param)=> {
                            let something = "a variable"
                            let something_else = "another"
                            console.log('STUFF');
                            console.log(this);
                            return <div>this is JSX</div>
                        }
                    `
            //console.clear()
            let output = Babel.transform(source,
                {
                    // plugins: ['lolizer'], 
                    presets: [["es2015", { modules: false }],
                        "react"],
                    sourceMap: "both",
                    filename: "client"
                },
            )
            try {
                console.log("EVALING")
                let code = eval(output.code).bind(this);
                let Logger
                if(initial){
                    Logger = new CMLogger(this.cm, output.map);
                } 
                else {
                    Logger = this.cm.Logger
                    this.cm.Logger.addSourceMap(output.map,offset)
                }
                let exported = {
                    source, output,
                    SourceMap, GDTEditor: this.props.gdtEditor, CodeEditor,
                    throttle, debounce, Logger,Changer
                }


                code(exported);
            } catch (e) {
                this.showRuntimeError(e);
                console.log(e)
            }

        } catch (e) {
            console.log("Show Error")
            this.showError(e)
            console.log(e)
        }
    }
    showRuntimeError(e) {
        this.cm.Logger.displayError(e)
    }
    gutterClick(cm, line, gutter, event){
        this.gutterClick1(cm, line, gutter, event )
    }
    initialize(cm) {
        if (!this.lastLine) this.lastLine = 0;
        if (!cm) return;
        this.cm = cm.getCodeMirror();
        // this.cm.setOption("fold", this.cm.constructor.fold.indent)
        if (module.hot) {
            // module.hot.addDisposeHandler(this.disposeHandler.bind(this))
        }	// if(moduleInitialized) return;

        for (let entry of this.callbacks) {
            this.cm.off(entry.event, entry.boundCB)
        }
        this.callbacks = []
        this.addCB("cursorActivity", debounce(this.cursorActivity, 50, true))
        this.cm.removeKeyMap("GTD");
        this.addCB("gutterClick", this.gutterClick)
        this.saveCode(this.cm)
        this.cm.addKeyMap({
            name: "GTD",
            "Ctrl-F": "findPersistent",
            "Ctrl-S": this.saveCode.bind(this)
        })
    }
    render() {
        var options = {
            lineNumbers: true,
            keyMap: "sublime",
            extraKeys: {
                "Ctrl-Q": function (cm) {
                    cm.foldCode(cm.getCursor());
                },
                "Ctrl-Space": "autocomplete",
                'Tab': 'insertSoftTab' 
            },
            foldGutter: { rangeFinder: BaseCodeMirror.fold.indent },
            gutters: ["CodeMirror-linenumbers",
            "CodeMirror-foldgutter",
            "arrow-gutter",
            "breakpoint-gutter"]
        };

        return (<div className="codeEditor">
            <CodeMirror
                ref={(entry) => { this.initialize(entry) }}
                onChange={this.onChange.bind(this)}
                options={options} />
            )
            </div>)

    }
}
export default CodeEditor;

