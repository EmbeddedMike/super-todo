console.clear()

/* changes
//end
endchanges */

//these two lines go together. Base tells where to offset the source maps
let base = this.cm.Logger.getCallerLine(0)
let source = `

let adder = 1
for( let i = 0; i < 3; i++ ){
  console.log("adder")
  let c = "10" 
  for(let j = 0; j < 10; j++) {
    adder = adder + j
    adder = adder + j
  }
  adder = adder + 1
  adder = adder + 1
}

`
/* changes//console.log(source)

//end
endchanges */

let diags ={
  showCode:false,
  showCompiled:true,
  showInstrumentation:false,
  showAttemptToAdd: false
  }
let Span = exported.glamorous.Span
let CodeSlider = () => <Span  fontSize={20} zIndex="2" backgroundColor="red"
      textAlign="center">Hello world</Span>
let DisplayString = (string) => 1
this.cm.Logger.renderAtPos({line: 42, ch:2}, <CodeSlider/>, "helloClass")
let clear = () => { this.cm.Logger.clearByClass("helloClass")}
setTimeout(clear.bind(this), 3000) 


let breakLines = []      //Lines with breakpoints
let visitedLines = []    //Count execution of lines visited during execution 
let locationList = []    //List of node 'loc' entries
let visitedSequence = [] //Sequence of locations visited
let assignedSequence = [] //sequence of value assignments
let forRanges = []

this.enterFor= (info) =>{
}
this.exitFor =  () => {
  forRanges.pop()
}

let log = this.cm.Logger.log
let zlog = (value, lhs) => {
  this.cm.Logger.log(value,2)
  let index = visitedSequence.length - 1
  if(!assignedSequence[index]) assignedSequence[index] = []
  assignedSequence[index].push({lhs, value})
}

this.visited = (index) => { 
  //called when a statement is visited
  //console.log(loc)console.log("clear");
  let loc = locationList[index]
  visitedSequence.push(index)
  visitedLines[loc.start.line] = visitedLines[loc.start.line] + 1 || 1
}
const getText = (node) => {
//get the text for a node
  if(node.start === undefined || !node.end === undefined) return "Missing start or end"
  return source.substr(node.start, node.end - node.start)
}
const addInstrumentationPath = (t, path, before) =>{ //add instrumentation before or after a node(by path)
  let insert = before ? path.insertBefore : path.insertAfter
  insert = insert.bind(path)
 
  if(diags.showInstrumentation) {
    if(before)
    console.log(path.type, code, getText(path.node))
   else
    console.log(path.type, getText(path.node),code)}
  insert(
    t.expressionStatement(t.stringLiteral("stuff here")))
  
  
  //now get the dummy node that was just added 
  let diff = before ? -1 : 1
  let sib = path.getSibling(path.key + diff) 
  return sib
}
const replacePathWithCode = (t, oldPath, newPath, code) =>{
  newPath.replaceWithSourceString(code)
  
  //update the node's location information
  newPath.node.loc = oldPath.node.loc
  newPath.node.start = oldPath.node.start
  newPath.node.end = oldPath.node.end
  //flag node as instrumentation
  newPath.node.isInstrumentation = true; 
}
const addInstrumentation = (t, path, before, code) =>{ 
  //add instrumentation (a string) before or after the path node
  let newPath = addInstrumentationPath(t, path, before)
  replacePathWithCode(t, path, newPath, code)
}

const addLogging = (t, path, expr) =>{
  //add code to log the value of the prior operation
  addInstrumentation(t, path, false, `zlog(${expr},"${expr}")`)
}
const setBreakLine = (line, value) => {
  if(breakLines[line] === undefined || breakLines[line] === true)
    breakLines[line]= value

}

const plugin = (babel) =>{
  //define a babel plugin to instrumment code
  let t = babel.types
  return {visitor: {
      
      Statement:{ 
        exit(path){
    
        if(path.node.isInstrumentation) {
          if(diags.showAttemptToAdd) console.log("Attempt to add to instrumentation at " + getText(path.node))
          return;
        }
        if(!path.node.loc) {
          console.log("Node without a location ")
          return;
        }
        //encode the source locator and instrument the visit
        locationList.push(path.node.loc)
        if(t.isForStatement(path)) {
          ///console.log("For statement", getText(path.node))
          let entryLoc = path.get('body').node.body[0].loc
          console.log(entryLoc)
          setBreakLine(entryLoc.start.line,false)
          path.get('body').unshiftContainer('body', t.expressionStatement(t.stringLiteral('before')));
          path.get('body').pushContainer('body', t.expressionStatement(t.stringLiteral('after')));
          console.log(path.get('body').node)
          //addInstrumentation(t, path, true, `this.enterFor(${locationList.length - 1})\n`)
        }else {
          if(t.isBlockStatement(path)) {
            console.log(path.type)
          } else {
            addInstrumentation(t, path, true, `this.visited(${locationList.length - 1})\n`)
          }
        if(!path.node.loc) {
          console.log("No node loc" + getText(path.node))
        }  else {
          setBreakLine(path.node.loc.start.line,true)
        }
        if(t.isVariableDeclaration(path)) {
          let declarations = path.get("declarations")
          path.get('body')
          for(let declaration of declarations){
            if(getText(declaration.node.init)){
            	addLogging(t, path, getText(declaration.node.id))
            }
           }
        }else 
        if( t.isExpressionStatement(path) ){
        	//path.stop()
          	let expr = path.get("expression")
            
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
  this.renderGutterSymbol(cm,line,"breakpoint-gutter", className)
}
this.renderArrowSymbol = (cm,line) => {
  this.renderGutterSymbol(cm,line,"arrow-gutter", "arrow")
}
this.renderGutterSymbol = (cm,line,gutter, className) => {
  let element = document.createElement("div")
  element.setAttribute("class", className)
  cm.getDoc().setGutterMarker(line, gutter, element)
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
    this.renderOne(cm, i + base - 2, breakLines[i])
  }
}
try {

if(diags.showCode) console.log(source)
let output = Babel.transform( source,
      {
          // plugins: ['lolizer'], 
          presets: [["es2015", { modules: false }],
              "react"],
          sourceMap: "both",
  		  plugins:[plugin]

		} )
		//console.log(breakLines)
		if(diags.showCompiled) console.log(output.code)
  		try{
          this.cm.Logger.addSourceMap(output.map, base)
          this.renderBreakDots(this.cm)
          eval(output.code)
          //console.log(visitedLines)
          let sliderProps = this.codeSlider.sliderProps
          sliderProps.max = visitedSequence.length
          this.codeSlider.sliderChange(0)
        }catch(e){
          console.log("RUNTIME ERROR", e)
        }
  
} catch(e){
  console.log("TRANSFORM ERROR", e);
}

this.sliderWasChanged = (value) =>{
  this.cm.clearGutter("arrow-gutter")
  let index = visitedSequence[+value]
  if(index === undefined) return
  let loc = locationList[index]
  let line = loc.start.line
  this.renderArrowSymbol(this.cm, line + base - 2)
  
  let assignments = assignedSequence[value]
  if(!assignments) return
  
  let n = assignments.length
  for(let i = 0; i < n; i++ ){
    let assignment = assignments[i]
    
    this.cm.Logger.logDataAt(line + base -2,`${assignment.lhs}=${assignment.value}`)
  }
  

}

let props = this.codeSlider.sliderProps
//this.codeSlider.sliderChange(80)




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