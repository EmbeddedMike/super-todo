let _this = this

class CMLogger {
  constructor(cm) {
    this.cm = cm
    this.logLines = []
  }
  deleteLogs(){
    let logs = document.getElementsByClassName("logdata");
    if (logs.length === 0) return;
    let list = []
    let log;
    for (log of logs) {
        list.push(log)
    }
 
    while (log = list.pop()) {
        console.log(log);
        log.parentElement.removeChild(log)
    }
  }
  logAtLine(line,text) {
    this.widgets = []

 
    let ch = this.cm.getLine(line).length

    let node = document.createElement("span")
    node.innerHTML = text
    node.className = "logdata";

    let widget = this.cm.addWidget({ line: line, ch: ch }, node)
    console.log(line, ch, text);
    //setTimeout( () => node.parentElement.removeChild(node), 1000 );
  }
  showData(){
      let values = this.logLines;
      let n = values.length;
      for (let i = 0; i < n; i++) {
          let value = values[i]
          if (value) {
              console.log(value, i)
              this.logAtLine(i - 1, value);
          }
      }
  }
  logDataAt(line,value){
    let values = this.logLines[line]
    if (!values) {
        this.logLines[line] = values = []
    }
    values.push(value);
}

}

let L = new CMLogger(_this.cm);
L.deleteLogs()

let smcs = []
let addSourceMap = (map, offset) =>
 
  smcs.push({
  map: (new SourceMap.SourceMapConsumer(map)),
  offset: offset}
  )
addSourceMap(output.map, 0);  
  
let getPosition = (spec) => {
    let n = smcs.length - 1;
    for (let i = n; i > -1; i--) {
        let pos = smcs[i].map.originalPositionFor(spec)
        pos.line += smcs[i].offset  	
        if (pos.source) return pos;
    }
}

let parseStackFrame = (frame) => {
    let matcher = frame.match(/at\s+(\S*).*:(\d+):(\d+)\)$/)
    if (matcher) {
        //console.log(matcher)
        let name = matcher[1]
        let line = +matcher[2]
        let column = +matcher[3]
        //console.log(name,line,column);
        return getPosition({ line, column })
    }
}

let dumpStack = () => {
    let stackFrames = new Error().stack.split("\n")
    stackFrames = stackFrames.slice(2, 12)
    //console.log(stackFrames)
    stackFrames.map((frame) => {
        console.log(parseStackFrame(frame))
    })
}

let foo = () => bar();

let getCallerLine = (n) => {
    let stackFrames = new Error().stack.split("\n")
    return parseStackFrame(stackFrames[2 + n]).line
}


let CL = (output) => {
    let line = getCallerLine(1);
    console.log(line, output)
    L.logDataAt(line, output)
}
CL("This")
for( let q = 0; q< 10; q++)
  CL(q)
let bar = () => {
    CL("in bar");
}
//foo()
//return;
let sourceOffset = 0

let getSource = () => {
    sourceOffset = getCallerLine(0);
return `
() => {
CL("Source offset is " + sourceOffset)

let fooX = () => {
CL("IN FOOX")
barX();
}

let barX = () => {
CL("IN BARX")
	foo();
}
fooX()
}
`}

try {
    let output1 = Babel.transform(getSource(),
        {
            // plugins: ['lolizer'], 
            presets: [["es2015", { modules: false }],
                "react"],
            sourceMap: "both",
            compact: false,
            filename: "inner",
            //inputSourceMap: output.map,
            sourceMapTarget: "thisfile.js",


        },
    )
    try {
        console.log(output1.map.sources)
        let code = eval(output1.code);

        addSourceMap(output1.map, sourceOffset); 
        code();
    } catch (e) {
        console.log(e)
    }

} catch (e) {
    console.log("Error")
    if (this.showError) this.showError(e)
    console.log(e)
}
L.showData()
return
_this.deleteNode = (node) => {

}

_this.showError = (e) => {
    const error = e.toString().split("\n")[0]
    const matcher = error.match(/(.*?)\((\d+):(\d+)/)
    const message = matcher[1]
    const line = matcher[2];
    const ch = matcher[3];
    _this.logData(matcher);
}

_this.callerLine = () => {
    try {
        throw new Error()
    }
    catch (e) {
        console.log(e.stack.split("\n")[3]);
        let callerLine = e.stack.split("\n")[3];
        callerLine = callerLine.split(",")[1]
        return (callerLine.match(/(\d+)/)[1]) - 1
    }
}




console.log("ran")