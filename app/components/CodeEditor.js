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
let immutable = require('immutable')
import throttle from 'lodash/throttle';
import { render } from 'react-dom'
import glamorous from "glamorous"
var Slider = require('nw-react-slider')
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/addon/search/matchesonscrollbar');
require('codemirror/addon/search/matchesonscrollbar.css');
require('nw-react-slider/dist/nw-react-slider.css')
require('mdi/css/materialdesignicons.css')
require("font-awesome-webpack")
import FAButton from "./FAButton"
require('codemirror/lib/codemirror.css');
require('codemirror/addon/mode/simple');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/edit/matchbrackets');
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
BaseCodeMirror.defineMode("changemode", function (config) {
    return BaseCodeMirror.multiplexingMode(
        BaseCodeMirror.getMode(config, "text/javascript"),
        {
            open: "/* changes", close: "endchanges */",
            mode: BaseCodeMirror.getMode(config, "text/javascript"),
            delimStyle: "comment"
        })
})
import CMLogger from '../js/cmlogger'
import SegMapper from '../js/computeSegments'
import Changer from "../js/syncchanges"
import { setUser } from "../actions/index.js"
const debounce = require("debounce")

window.onbeforeunload = function () {
    return "Are you sure you want to navigate away?";
}
const MaterialButton = (props) => {
    return <i className="material-icons">{props.text}</i>
}

class CodeSlider extends React.Component {
    constructor(props) {
        super(props);
        this.sliderProps = {
            value: 5,
            min: 0, max: 20,
        }
    }
    sliderUpdate(value) {
        console.log(value)
    }
    sliderChange(value) {
        this.sliderProps.value = value
        //this.sliderUpdate(value)
        if (this.props.parentComponent.sliderWasChanged) {
            this.props.parentComponent.sliderWasChanged(value)
        }
        // if(this.props.sliderWasChanged)
        //     this.props.sliderWasChanged(value)
        this.forceUpdate()
        // this.sliderProps.value = value
    }
    setSliderProps(props) {
        this.sliderProps = props
    }
    getSliderProps(props) {
        return this.sliderProps
    }
    render() {
        return (<Slider
            value={this.sliderProps.value}
            min={this.sliderProps.min}
            max={this.sliderProps.max}
            ticks
            markerLabel={this.sliderProps.markerLabel}
            onChange={this.sliderChange.bind(this)}
        />)
    }

}
class CodeEditor extends React.Component {
    //F: initialize
    constructor(props) {
        super(props);
        this.state = { code: "//Test" }
        this.callbacks = []
        this.sliderProps = { value: 5, min: 0, max: 10, markers: [{ value: 3, label: 'Three' }, { value: 8, label: 'Eight' }] }
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

    showError(e, offset = 0) {
        let eLine = e.stack.split("\n")[0];
        console.log(eLine);
        let matcher = eLine.match(/^(.*):\s(.*):(.*)\((\d+):(\d+)/)
        if (matcher) {
            let message = matcher[1] + " " + matcher[3]
            let line = +matcher[4]
            line = line - 2
            let ch = +matcher[5]
            let MessageDiv = glamorous.div({backgroundColor: "#eee8aa"})
            message = <MessageDiv ><pre>{Array(ch + 1).join(" ")+"^"}</pre>{message}</MessageDiv>
            this.cm.Logger.widgetBelowLine(line, message)
        } else {
            this.cm.Logger.widgetBelowLine(this.cm.getCursor().line, eLine, "errormessage")
        }
    }
    cursorActivity(cm) {
        this.actuallyMoved(cm)
    }
    actuallyMoved(cm) {
        //console.log("actually moved")
    }
    saveCode(cm) {
        console.log("saving code")
        this.props.dispatchAction({ type: "save_contents", data: this.cm.getValue() })
        this.bindAndCompile(cm)
    }
    bindAndCompile(cm) {
        this.exported = {
            SourceMap, GDTEditor: this.props.gdtEditor, CodeEditor,
            throttle, debounce, Changer, render, glamorous,
            immutable,Babel
        }
        try {
            //this.changer = new Changer(cm)
            this.debouncedCompile = debounce((cm) =>
                this.compileCode(cm), 800);
            this.modChange = debounce((cm) => {
                this.cm.Logger.clearLogs()
                //this.changer.syncChanges(cm)
                this.debouncedCompile(cm)
                //setTimeout( this.clearError.bind(this), 2000)
            }, 300, false)

            this.compileCode(cm)
        } catch (e) {
            console.log(e)
        }
    }

    compileCode(cm) {
        let source = this.cm.getValue();
        if (source.match(/NEWCOMPILE/) && this.compileSegments) {
            try {
                this.compileSegments()
                return
            } catch (e) {
                console.log("Failed compileSegs")
                console.log(e)
                return
            }
        }
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
        this.compileAndRun(sTop, 0, true,"first")
        this.compileAndRun(sBottom, 0, false, "second")
    }
    compileAndRun(source, offset, initial = true, name='default.js') {
        source = source.replace(/export default\s*/, '')
        source = source.replace(/\/\/IF editor\s*/g, '')
        source = "(exported) => {\n" + source + "}"
        
        // console.log("before",source)
        // window._thisThing = this
        // let gsources = `((exported) => {
        //     ${source} 
        // }).bind(window._thisThing)((ffwindow._thisThing.exported))`
        // console.log("after", source)
        
        try {
            let output = Babel.transform(source,
                {
                    // plugins: ['lolizer'], 
                    presets: [["es2015", { modules: false }],
                        "react"],
                    sourceMap: "both",
                    sourceFileName: name + ".js",
                    sourceRoot: "root/",
                    filenameRelative: name + ".js"
                },
            )
            try {
                let code = output.code
                code += (`\n//# sourceURL=${name}.js\n`)
                code = eval(code).bind(this);
                // //console.log(output.map)
                // //code = "//# sourceURL=clientZY.js\n"+code
                // let addCode = (code) => {

                //     var JS = document.createElement('script');
                //     JS.text = code;
                //     document.body.appendChild(JS);
                //     return JS
                // }
                // let deleteCode = (node) => {
                //     document.body.removeChild(node)
                // }
                // // let countScripts = () => console.log(document.getElementsByTagName("script").length)
                // // countScripts()
                // //let node = addCode(code)

                // // countScripts()
                // //deleteCode(node)
                
                // // countScripts()
                if (initial) {
                    new CMLogger(this.cm, output.map, offset);
                }
                else {
                    this.cm.Logger.addSourceMap(output.map, offset)
                }
                code(this.exported);
            } catch (e) {
                this.cm.Logger.displayError(e);
                console.log(e)
            }

        } catch (e) {
            this.showError(e, offset)
            //console.log(e)
        }
    }
    showRuntimeError(e) {
        this.cm.Logger.displayError(e)
    }
    gutterClick(cm, line, gutter, event) {
        this.gutterClick1(cm, line, gutter, event)
    }
    initialize(cm) {
        if (!this.lastLine) this.lastLine = 0;
        if (!cm) return;
        new SegMapper(this)
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

        this.bindAndCompile(this.cm)
        this.cm.setValue(this.props.editorContents)
        this.cm.addKeyMap({
            name: "GTD",
            "Ctrl-F": "findPersistent",
            "Ctrl-S": this.saveCode.bind(this)
        })
    }

    codeSliderRef(ref) {
        this.codeSlider = ref
    }
    sliderWasChanged(val) {
        console.log("SLIDER CHANGED TO ", val)
    }
    setSegMap(segMap) {
        this.segMap = segMap
    }

    render() {
        var options = {
            lineNumbers: true,
            mode: "changemode",
            keyMap: "sublime",
            matchBrackets: true,
            autoCloseBrackets: true,
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
            <MaterialButton text="face" />
            <MaterialButton text="pause" />
            <FAButton type="fa-twitter" />
            <FAButton contents="fa-twitter" />


            <CodeSlider
                sliderWasChanged={this.sliderWasChanged}
                parentComponent={this}
                ref={(entry) => { this.codeSliderRef(entry) }} />
            <CodeMirror
                ref={(entry) => { this.initialize(entry) }}
                onChange={this.onChange.bind(this)}
                options={options} />
            )
            </div>)

    }
    componentWillReceiveProps(nextProps) {
        console.log("Now props", nextProps, this.props)
        console.log("Setting", nextProps.editorContents)
        this.cm.setValue(nextProps.editorContents)
    }
}
import { connect } from "react-redux";
const mapStateToProps = (state, ownProps) => {
    console.log("Mappers state callback")
    return { editorContents: state.editorContents }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatchAction: (action) => {
            dispatch(action)
        }
    }
}

//export default CodeEditor;
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CodeEditor);