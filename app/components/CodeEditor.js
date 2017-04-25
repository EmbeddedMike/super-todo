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
    initialize(cm) {
        if (!this.lastLine) this.lastLine = 0;
        if (!cm) return;
        this.cm = cm.getCodeMirror();
        console.log("GDTEditor", this.props.gdtEditor)
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
        this.cm.addKeyMap({
            name: "GTD",
            "Ctrl-F": "findPersistent",
            "Ctrl-S": (cm) => {
                let code = this.cm.getValue();
                try {
                    eval("(_this) => {" + this.config + "}")(this)
                } catch (e) {
                    console.log(e)
                }
            }
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