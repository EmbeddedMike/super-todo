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
let q,r,s,t = 10
let b = "this thing"
log('this is a test')
let a
a = "statement" + 
  "some more"
let d = "this thing"

a = a + "foo" 

`
let log = this.cm.Logger.log
const getText = (node) =>
{
  return source.substr(node.start, node.end - node.start)
}
const addLogging = (t, path, expr) =>{
  path.insertAfter(
    t.expressionStatement(t.stringLiteral("stuff here")))
  let sib = path.getSibling(path.key + 1)
  
  sib.replaceWithSourceString(`log("${expr} = " + ${expr})`)
  sib = path.getSibling(path.key + 1)
  sib.node.loc = path.node.loc
}
const plugin = (babel) =>{
  let t = babel.types
  return {visitor: {
      Statement(path){
        log(path.type)
        if(t.isVariableDeclaration(path)) {
          let declarations = path.get("declarations")
          
          for(let declaration of declarations){
            if(getText(declaration.node.init)){
            	addLogging(t, path,getText(declaration.node.id))
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

try {
let output = Babel.transform(source,
      {
          // plugins: ['lolizer'], 
          presets: [["es2015", { modules: false }],
              "react"],
          sourceMap: "both",
  		  plugins:[plugin]

		} )
		console.log(output.code)
  		try{
          this.cm.Logger.addSourceMap(output.map, 2)
          eval(output.code)
        }catch(e){
          console.log(e)
        }
  
} catch(e){
  console.log(e);
}
