class CMLogger {
    constructor(cm) {
        this.cm = cm
        this.logLines = []
        this.smcs = []

    }
    
    deleteByClass(className) {
        let logs = document.getElementsByClassName(className);
        let n = logs.length
        for (let i = 0; i< n; i++) {
          let log = logs[i]
          log.parentElement.removeChild(log)
        }
     
    }
    deleteLogs(){
      this.deleteByClass("logdata")
      this.deleteByClass("errormessage");
    }
  	logAtLine(line, text, className = "logdata") {
        this.widgets = []


        let ch = this.cm.getLine(line).length

        let node = document.createElement("span")
        node.innerHTML = text
        node.className = className;

        let widget = this.cm.addWidget({ line: line, ch: ch }, node)
        //console.log(line, ch, text);
        //setTimeout( () => node.parentElement.removeChild(node), 1000 );
    }
    showData() {
        let values = this.logLines;
        let n = values.length;
        for (let i = 0; i < n; i++) {
            let value = values[i]
            if (value) {
                //console.log(value, i)
                this.logAtLine(i - 1, value);
            }
        }
    }
    logDataAt(line, value) {
        let values = this.logLines[line]
        if (!values) {
            this.logLines[line] = values = []
        }
        values.push(value);
    }

    addSourceMap(map, offset) {

        this.smcs.push({
            map: (new SourceMap.SourceMapConsumer(map)),
            offset: offset
        }
        )
    }
    getPosition(spec) {
        let n = this.smcs.length - 1;
        for (let i = n; i > -1; i--) {
            let pos = this.smcs[i].map.originalPositionFor(spec)
            pos.line += this.smcs[i].offset
            //console.log(pos);
            if (pos.source) return pos;
        }
    }

    parseStackFrame(frame) {
        let matcher = frame.match(/at\s+(\S*).*:(\d+):(\d+)\)$/)
        if (matcher) {
            //console.log(matcher)
            let name = matcher[1]
            let line = +matcher[2]
            let column = +matcher[3]
            //console.log(name,line,column);
            return this.getPosition({ line, column })
        }
    }
    CL(output) {
        let line = this.getCallerLine(1);
        //console.log(line, output)
        this.logDataAt(line, output)
    }
    getCallerLine(n) {
        let stackFrames = new Error().stack.split("\n")
        return this.parseStackFrame(stackFrames[2 + n]).line
    }
    displayError(e){
      let stackFrames = e.stack.split("\n")
  	  let line = this.parseStackFrame(stackFrames[1]).line - 1
      let message = stackFrames[0]
      this.logAtLine(line, message, "errormessage")
    }

}

console.clear()

let L = new CMLogger(this.cm);
L.addSourceMap(output.map, 0)
L.deleteLogs()
let CL = L.CL.bind(L)
CL("Thisis")

try {
  throw new Error("WOW");
}catch (e){
  
  
  L.displayError(e);
}


L.showData()
