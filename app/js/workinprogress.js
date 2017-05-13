let a = { b: "c",d: 1234}
this.debouncedCompile = debounce((cm) => {
        console.log("Debounced");
        this.compileCode(cm), 100});

let log = this.cm.Logger.log
let hinter = BaseCodeMirror.hint.anyword

//console.log(this.adjustSource);
console.log("THIS") ;

let patch = {
  adjustSource(source) {
    console.clear();
    console.log("Alternate adjustment")
    let lines = source.split("\n")
    let n = lines.length //?
    let newLines = []
    for(let i = 0; i< n; i++){
      let line = lines[i]
      let matcher = line.match(/^\s*(let)?(\s*.*)(\s*=.*)\/\/\?\s*$/)
      newLines[i] = line
      if(matcher ) {
        newLines[i] = `${matcher[1]+matcher[2]+matcher[3]}; log(${matcher[2]})`
        let q = newLines[i] //?
        console.log(newLines[i])
      }
    } 
    source = newLines.join("\n");
    //console.log(source) 
    return source
  },
  returnSource(source){
    console.log("returns same")
    return source
  }
}    

//setTimeout(()=>this.adjustSource = patch.returnSource,5000)
this.adjustSource = patch.adjustSource;
//console.log(this.adjustSource);

;
log("stuff");;;;;;;;;;;;;;;;
===================================
   console.clear()
let source = `
let log = this.cm.Logger.log

let adder = 1

for( let i = 0; i < 3; i++ ){
  console.log("adder")
  let c = "10"
  adder = adder + 1
  adder = adder + 1
}
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
let breakLines = []
let visitedLines = []
let locationList = []
this.visited = (index) => {
  //console.log(loc)
  let loc = locationList[index]
  visitedLines[loc.start.line] = visitedLines[loc.start.line] + 1 || 1
}
let log = this.cm.Logger.log
const getText = (node) =>
{
  return source.substr(node.start, node.end - node.start)
}

const addInstrumentation = (t, path, before, code) =>{
  //if(before) return;
  let insert = before ? path.insertBefore : path.insertAfter
  insert = insert.bind(path)
 
  insert(
    t.expressionStatement(t.stringLiteral("stuff here")))
  let diff = before ? -1 : 1
  let sib = path.getSibling(path.key + diff)
  sib.replaceWithSourceString(code)
  sib = path.getSibling(path.key + diff)
  sib.node.loc = path.node.loc
  sib.node.start = path.node.start + 1
  sib.node.end = path.node.end
  sib.node.isInstrumentation = true;
}
const addLogging = (t, path, expr) =>{
  addInstrumentation(t, path, false, `log("${expr} = " + ${expr})`)
}
const plugin = (babel) =>{
  let t = babel.types
  return {visitor: {
      
      Statement:{ 
        exit(path){
        //console.log("statement",getText(path.node))
        if(path.node.isInstrumentation) return;
        locationList.push(path.node.loc)
        addInstrumentation(t, path, true, `this.visited(${locationList.length - 1})`)
        if(path.node.loc) breakLines[path.node.loc.start.line] = true
        console.log(path.type)
        if(t.isVariableDeclaration(path)) {
          let declarations = path.get("declarations")
          
          for(let declaration of declarations){
            if(getText(declaration.node.init)){
            	addLogging(t, path, getText(declaration.node.id))
            }
           }
        }else 
        if( t.isExpressionStatement(path)){
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
let output = Babel.transform(source,
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
          this.cm.Logger.addSourceMap(output.map, 2)
          this.renderBreakDots(this.cm)
          eval(output.code)
          console.log(visitedLines)

        }catch(e){
          console.log(e)
        }
  
} catch(e){
  console.log(e);
}

