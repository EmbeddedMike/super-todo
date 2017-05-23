console.clear()
let log = this.cm.Logger.log
let zlog = (output) => {
  this.cm.Logger.log(output,2)
}

//these two lines go together. Base tells where to offset the source maps
let base = this.cm.Logger.getCallerLine(0)
let source = `
let a = 10
log("a test")
let myFunction = () =>{
 let another = 10
}
myFunction()
let adder = 1
for( let i = 0; i < 3; i++ ){
  console.log("adder")
  let c = "10"
  adder = adder + 1
  adder = adder + 1
}

`
let rest = `
 
let qqq = 1

let q,r,s,t = 10
let b = "this thing"

log('this is a test')


let a

a = "statement" + 
  "some more"
let d = "this thing"

a = a + "foo" 
/*
*/
`
/* changes
//end
endchanges */
let Span = exported.glamorous.Span
let CodeSlider = () => <Span  fontSize={20} zIndex="2" backgroundColor="red"
      textAlign="center">Hello world</Span>
let DisplayString = (string) => 1
this.cm.Logger.renderAtPos({line: 42, ch:2}, <CodeSlider/>, "helloClass")
let clear = () => {console.log("clear"); this.cm.Logger.clearByClass("helloClass")}
setTimeout(clear.bind(this), 3000) 


let breakLines = []      //Lines with breakpoints
let visitedLines = []    //Count execution of lines visited during execution 
let locationList = []    //List of node 'loc' entries
let visitedSequence = [] //Sequence of locations visited
this.visited = (index) => { 
  //called when a statement is visited
  //console.log(loc)
  let loc = locationList[index]
  visitedSequence.push(index)
  visitedLines[loc.start.line] = visitedLines[loc.start.line] + 1 || 1
}
const getText = (node) => {
//get the text for a node
  if(node.start === undefined || !node.end === undefined) return "Missing start or end"
  return source.substr(node.start, node.end - node.start)
}

const addInstrumentation = (t, path, before, code) =>{ //add instrumentation before or after a node(by path)
  //add instrumentation (a string) before or after the path node
  
  //insert a dummy before or after the node
  let insert = before ? path.insertBefore : path.insertAfter
  insert = insert.bind(path)
 
  if(before)
    console.log(path.type, code, getText(path.node))
  else
    console.log(path.type, getText(path.node),code)
  insert(
    t.expressionStatement(t.stringLiteral("stuff here")))
  
  
  //now get the dummy node that was just added 
  let diff = before ? -1 : 1
  let sib = path.getSibling(path.key + diff) 
  
  //Now replace that node with code from the string
  sib.replaceWithSourceString(code)
  
  //update the node's location information
  sib.node.loc = path.node.loc
  sib.node.start = path.node.start
  sib.node.end = path.node.end
  
  
  //flag node as instrumentation
  sib.node.isInstrumentation = true; 
}

const addLogging = (t, path, expr) =>{
  //add code to log the value of the prior operation
  addInstrumentation(t, path, false, `zlog(${expr},"${expr}")`)
}

const plugin = (babel) =>{
  //define a babel plugin to instrumment code
  let t = babel.types
  return {visitor: {
      
      Statement:{ 
        exit(path){
        //console.log("statement",getText(path.node))
        if(path.node.isInstrumentation) {
          console.log("Attempt to add to instrumentation at " + getText(path.node))
          return;
        }
        if(!path.node.loc) {
          console.log("Node without a location ")
          return;
        }
        //encode the source locator and instrument the visit
        locationList.push(path.node.loc)
        addInstrumentation(t, path, true, `this.visited(${locationList.length - 1})\n`)
                
        if(!path.node.loc) {
          console.log("No node loc" + getText(path.node))
        }  else {
          breakLines[path.node.loc.start.line] = true
        }
        if(t.isVariableDeclaration(path)) {
          let declarations = path.get("declarations")
          
          for(let declaration of declarations){
            if(getText(declaration.node.init)){
            	addLogging(t, path, getText(declaration.node.id))
            }
           }
        }else 
        if( t.isExpressionStatement(path) ){
        	//path.stop()
          	let expr = path.get("expression")
            log(expr.type)
            if(t.isAssignmentExpression(expr)){
              let left = expr.get("left")
              let text = getText(expr.get("left").node)
              addLogging(t, path, text)
            }
        }
      }
 	 }
    }
  }
   
}
this.cm.clearGutter("breakpoint-gutter")
this.gutterClick1 = (cm, line, gutter, event) =>{
  if(gutter != "breakpoint-gutter") return;
  if(breakLines[line] != undefined){
    breakLines[line] = !breakLines[line]
  }
  this.renderOne(cm, line, breakLines[line])
}
this.renderBreakSymbol = (cm,line,className) => {
  let element = document.createElement("div")
  element.setAttribute("class", className)
  cm.getDoc().setGutterMarker(line, "breakpoint-gutter", element)
}
this.renderOne = (cm, line, which ) => {
    switch(which){
      case undefined:
        cm.getDoc().setGutterMarker(line, "breakpoint-gutter", null)
        break;
      case true:
        this.renderBreakSymbol(cm, line, "breakdot")
        break;
      case false:
        this.renderBreakSymbol(cm, line, "breakpoint")
        break;
    }
  
}
this.renderBreakDots = (cm) =>
{
  let n = breakLines.length
  for( let i = 0; i < n; i++ ) {
    this.renderOne(cm, i, breakLines[i])
  }
}
try {

console.log(source)
let output = Babel.transform( source,
      {
          // plugins: ['lolizer'], 
          presets: [["es2015", { modules: false }],
              "react"],
          sourceMap: "both",
  		  plugins:[plugin]

		} )
		//console.log(breakLines)
		console.log(output.code)
  		try{
          this.cm.Logger.addSourceMap(output.map, base)
          this.renderBreakDots(this.cm)
          eval(output.code)
          //console.log(visitedLines)

        }catch(e){
          console.log("RUNTIME ERROR", e)
        }
  
} catch(e){
  console.log("TRANSFORM ERROR", e);
}


/*
console.clear()

//Section type:text

/* changes
 //compile:
 XcompileCode(cm) {
        let source = cm.getValue();
        let aLines = source.split("\n")
        let n = aLines.length
        let aSegments = []
        let sectionHeader = (line) => line.match(/\/\/\s*Section\s*(.*)/)
        let i = 0;
        let segNo = 0
        for( ; i< n; i++){
            let iStart = i
            let line =  aLines[i]
            let segment = []
            if(!sectionHeader(line))
              segment.push("FAKE SEGMENT")
            segment.push(line)
            for(i++; i< n; i++){
              line = aLines[i]
              if(sectionHeader(line)){
                i--
                break;
              }
              segment.push(line)
            }
            //this.compileAndRun(segment.join("\n"), iStart, iStart === 0)
            console.log(iStart, i, iStart === 0)
          
        }      
    }
//end


//Section name: foo, other: bar
class CodeEditor_Patch {
 //compile:
 XcompileCode(cm) {
        let source = cm.getValue();
        let aLines = source.split("\n")
        let n = aLines.length
        let aSegments = []
        let sectionHeader = (line) => line.match(/\/\/\s*Section\s*(.*)/)
        let i = 0;
        let segNo = 0
        for( ; i< n; i++){
            let iStart = i
            let line =  aLines[i]
            let segment = []
            if(!sectionHeader(line))
              segment.push("FAKE SEGMENT")
            segment.push(line)
            for(i++; i< n; i++){
              line = aLines[i]
              if(sectionHeader(line)){
                i--
                break;
              }
              segment.push(line)
            }
            //this.compileAndRun(segment.join("\n"), iStart, iStart === 0)
            console.log(iStart, i, iStart === 0)
          
        }      
    }
}
console.log(Object.getOwnPropertyNames(CodeEditor_Patch.prototype))
for(var prop in CodeEditor_Patch.prototype){
    console.log(CodeEditor_Patch.prototype[prop]);
}
//Section name: foo, other: bar
for(key in Object.keys(CodeEditor_Patch.prototype)) console.log(key) //this[key] = CodeEditor_Patch[key].bind(this)
//this.XcompileCode(this.cm)
new CodeEditor_Patch().XcompileCode(this.cm)


*/
console.clear()


let Span = exported.glamorous.Span
let HelloWorld = () => <Span  fontSize={20} zIndex="2" backgroundColor="red"
      textAlign="center">Hello world</Span>
let DisplayString = (string) => 1
this.cm.Logger.renderAtPos({line: 6, ch:2}, <HelloWorld/>, "helloClass")
let clear = () => {console.log("clear"); this.cm.Logger.clearByClass("helloClass")}
setTimeout(clear.bind(this), 1000)

return
//Section type:text

//exported.render(<HelloWorld />, document.getElementById('root'));
/* changes
 //compile:
 XcompileCode(cm) {
        let source = cm.getValue();
        let aLines = source.split("\n")
        let n = aLines.length
        let aSegments = []
        let sectionHeader = (line) => line.match(/\/\/\s*Section\s*(.*)/)
        let i = 0;
        let segNo = 0
        for( ; i< n; i++){
            let iStart = i
            let line =  aLines[i]
            let segment = []
            if(!sectionHeader(line))
              segment.push("FAKE SEGMENT")
            segment.push(line)
            for(i++; i< n; i++){
              line = aLines[i]
              if(sectionHeader(line)){
                i--
                break;
              }
              segment.push(line)
            }
            //this.compileAndRun(segment.join("\n"), iStart, iStart === 0)
            console.log(iStart, i, iStart === 0)
          
        }      
    }
//end


//Section name: foo, other: bar
let displayValue = (value) => {
  
}
class CodeEditor_Patch {
 //compile:
 XcompileCode(cm) {
        let source = cm.getValue();
        let aLines = source.split("\n")
        let n = aLines.length
        let aSegments = []
        let sectionHeader = (line) => line.match(/\/\/\s*Section\s*(.*)/)
        let i = 0;
        let segNo = 0
        for( ; i< n; i++){
            let iStart = i
            let line =  aLines[i]
            let segment = []
            if(!sectionHeader(line))
              segment.push("FAKE SEGMENT")
            segment.push(line)
            for(i++; i< n; i++){
              line = aLines[i]
              if(sectionHeader(line)){
                i--
                break;
              }
              segment.push(line)
            }
            //this.compileAndRun(segment.join("\n"), iStart, iStart === 0)
            console.log(iStart, i, iStart === 0)
          
        }      
    }
}
console.log(Object.getOwnPropertyNames(CodeEditor_Patch.prototype))
for(var prop in CodeEditor_Patch.prototype){
    console.log(CodeEditor_Patch.prototype[prop]);
}
//Section name: foo, other: bar
for(key in Object.keys(CodeEditor_Patch.prototype)) console.log(key) //this[key] = CodeEditor_Patch[key].bind(this)
//this.XcompileCode(this.cm)
new CodeEditor_Patch().XcompileCode(this.cm)


console.clear()
let Span = exported.glamorous.Span
let HelloWorld = () => <Span  fontSize={20} zIndex={5} backgroundColor="white"
      textAlign="center">Hello world</Span>
let DisplayString = (string) => 1 
this.cm.Logger.renderAtPos({line: 6, ch:2}, <HelloWorld/>, "helloClass")
let clear = () => {console.log("clear"); this.cm.Logger.clearByClass("helloClass")}
setTimeout(clear.bind(this), 1000)

return
//Section type:text

//exported.render(<HelloWorld />, document.getElementById('root'));
/* changes
 //compile:
 XcompileCode(cm) {
        let source = cm.getValue();
        let aLines = source.split("\n")
        let n = aLines.length
        let aSegments = []
        let sectionHeader = (line) => line.match(/\/\/\s*Section\s*(.*)/)
        let i = 0;
        let segNo = 0
        for( ; i< n; i++){
            let iStart = i
            let line =  aLines[i]
            let segment = []
            if(!sectionHeader(line))
              segment.push("FAKE SEGMENT")
            segment.push(line)
            for(i++; i< n; i++){
              line = aLines[i]
              if(sectionHeader(line)){
                i--
                break;
              }
              segment.push(line)
            }
            //this.compileAndRun(segment.join("\n"), iStart, iStart === 0)
            console.log(iStart, i, iStart === 0)
          
        }      
    }
//end


//Section name: foo, other: bar
let displayValue = (value) => {
  
}
class CodeEditor_Patch {
 //compile:
 XcompileCode(cm) {
        let source = cm.getValue();
        let aLines = source.split("\n")
        let n = aLines.length
        let aSegments = []
        let sectionHeader = (line) => line.match(/\/\/\s*Section\s*(.*)/)
        let i = 0;
        let segNo = 0
        for( ; i< n; i++){
            let iStart = i
            let line =  aLines[i]
            let segment = []
            if(!sectionHeader(line))
              segment.push("FAKE SEGMENT")
            segment.push(line)
            for(i++; i< n; i++){
              line = aLines[i]
              if(sectionHeader(line)){
                i--
                break;
              }
              segment.push(line)
            }
            //this.compileAndRun(segment.join("\n"), iStart, iStart === 0)
            console.log(iStart, i, iStart === 0)
          
        }      
    }
}
console.log(Object.getOwnPropertyNames(CodeEditor_Patch.prototype))
for(var prop in CodeEditor_Patch.prototype){
    console.log(CodeEditor_Patch.prototype[prop]);
}
//Section name: foo, other: bar
for(key in Object.keys(CodeEditor_Patch.prototype)) console.log(key) //this[key] = CodeEditor_Patch[key].bind(this)
//this.XcompileCode(this.cm)