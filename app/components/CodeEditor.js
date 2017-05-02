const React = require('react'); //feature: react
const CodeMirror = require('react-codemirror');
import SocketStatus from "./socketStatus";
const Babel = require("babel-standalone")
console.log("babel", Babel)
const BaseCodeMirror = require('codemirror/lib/codemirror')
require('codemirror/addon/dialog/dialog')
require('codemirror/addon/search/searchcursor')
require('codemirror/addon/search/search')

let SourceMap = require("source-map")
require('codemirror/keymap/sublime')
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

require('../css/gtdflow.css')
import { setUser } from "../actions/index.js"
const debounce = require("debounce")


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
    cursorActivity(cm) {

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
        let saveCode = (cm) => {
            // let lolizer = () => {
            //     return {
            //         visitor: {
            //             Identifier(path) {
            //                 path.node.name = 'LOL';
            //             }
            //         }//     }
            // }
            // Babel.registerPlugin('lolizer', lolizer);
            let source = this.cm.getValue();
            source = "(source,output,SourceMap) => {" + source + "}"
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
                console.clear()
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
                    console.log("EVAL")
                    let code = eval(output.code).bind(this);
                    code(   source,output,SourceMap);
                } catch (e){
                    console.log(e)
                }

            } catch (e) {
                console.log("Error")
                if(this.showError) this.showError(e)
                console.log(e)
            }
        }
        saveCode()
        this.cm.addKeyMap({
            name: "GTD",
            "Ctrl-F": "findPersistent",
            "Ctrl-S": saveCode.bind(this)
        })
    }
    render() {
        var options = {
            lineNumbers: true,
            extraKeys: {},
            keyMap: "sublime",
            extraKeys: {
                "Ctrl-Q": function (cm) {
                    cm.foldCode(cm.getCursor());
                }
            },
            foldGutter: { rangeFinder: BaseCodeMirror.fold.indent },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        };

        return (<div className="codeEditor">
            <CodeMirror
                ref={(entry) => { this.initialize(entry) }}
                options={options} />
            )
            </div>)

    }
}
export default CodeEditor;

/*
let _this = this
_this.deleteNode  = (node) => {
  
}

_this.deleteLogs = () => {
  let logs = document.getElementsByClassName("logdata");
  if(logs.length === 0) return;
  let list = []
  let log;
  for(log of logs){
    list.push(log)
  }
  while(log = list.pop()){
    
    
    log.parentElement.removeChild(log)
  }
  
}

_this.logLines = []

_this.callerLine = () =>{
  try{
    throw new Error()
  }
  catch(e) {
    let callerLine = e.stack.split("\n")[3];
    callerLine = callerLine.split(",")[1]
    return (callerLine.match(/(\d+)/)[1]) - 1  
  }
}

_this.logData = (value) => {
  let line = _this.callerLine()
  let values = _this.logLines[line]
  if(!values){
    _this.logLines[line] = values = []
  }
  values.push(value);
}

_this.logAtLine = (line, text) =>{
  _this.widgets = []

  //let line = _this.cm.getCursor().line
 
  let ch = _this.cm.getLine(line).length
  // let pixel = _this.cm.charCoords({line, ch: null})
  let node = document.createElement("span")
  node.innerHTML = text
  node.className = "logdata";
  
  let widget = _this.cm.addWidget({line: line,ch: ch}, node)
  console.log(line, ch, text);
  //setTimeout( () => node.parentElement.removeChild(node), 1000 );
}
_this.deleteLogs();
for( let i = 0; i < 10; i++ ){
  _this.logData(i);
}
_this.logData("I am right here");
_this.dumpData = () => {
  let values = _this.logLines;
  let n = values.length;
  for( let i = 0; i< n; i++){
    let value = values[i]
    if( value ) {
      console.log(value, i)
      _this.logAtLine( i, value);
    }
  }
}
_this.dumpData();
console.log("ran")

*/