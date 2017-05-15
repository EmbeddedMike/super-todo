let log = this.cm.Logger.log.bind(Logger)
Logger.logMessageAtLine = Logger.logMessageAtLine.bind(Logger)
//console.clear();
//this.modChange = ()=>{}
if(this.toggleChange){
}
  this.toggleChange = !this.toggleChange
let test = () => {
let L = this.cm.Logger;
let thisCM = this.cm
let c = new Changer(this.cm)
let change = () => {
//some text:
    {
let a = 10;
  a = 10
  b = 1
  
    }
//some more:
    {
let b = 20
b = b + 1
    }
//and more:
    {
let thisOne = "should be there"
    }
}

//some text:
let a = 10;
  a = 10
  b = 1
  
//some more:
let b = 20
b = b + 1
//end
let something = "should not be included"  
  
//and more:
let thisOne = "should be there"
//end

let bothFunction = (cm) => {
   if(true || !c.isInChange()){
      let changeLoc = c.findChange()
      if(!changeLoc) changeLoc = {start: 2, end:2}
      console.log("changeloc", changeLoc)
      c.scanBody(15)
      if(changeLoc){
        console.log("bodyMapping", c.bodyMap);
        let changeText = c.makeChangeText();
        c.replaceChange(changeLoc,changeText)
      }
  } else {
      c.scanChange()
      //this.replaceCorresponding()
  }
  
}

let onChange = (cm) => {
 
}
 
let onCursor = (cm) => {
  bothFunction(cm)
  /*
  console.log(c.ChangeLoc)
  let inside = c.isChangeVisible()
  let line = this.cm.getCursor().line
  let message = inside ? "visible" : "notvisible"
  cm.Logger.logMessageAtLine(line,message) 
  console.log("cursor"); 
  */
}

let debounce = exported.debounce
onChange = debounce(onChange,100);
onCursor = debounce(onCursor,100);
let recall = (event, cb) =>{
  let cm = this.cm
  let uncall = () => {
    console.log(event + " off")
    cm.off(event, cb)
  }
  setTimeout(uncall, 10000) 
  cm.on(event, cb)
}

recall("cursorActivity", onCursor);
recall("change", onChange); 
 

} //end of test
class Changer {
    constructor(cm) {
        this.cm = cm
        let Logger = cm.Logger
        this.clearLogs = Logger.clearLogs.bind(Logger)
        this.logMessageAtLine = Logger.logMessageAtLine.bind(Logger)
        this.setLoggerMapping = Logger.setMapping.bind(Logger)
        this.clearMaps()
    } 
  	  
  	findChange(){
      let getLine = (i) => this.cm.getLine(i)
      let n = this.cm.lineCount()

      for(let i = 0; i < n; i++ ){
        if(getLine(i).match(/^let\s+change\s*=\s*\(\)\s*=>\s*{/)){
          let start = i;
          for( ;i < n; i++){
            if(getLine(i).match(/^}/)){
              return this.changeLoc = {start,end: i}
            }
          }
        }
      }
      return this.changeLoc = null
    }
    isChangeVisible(){
      if(!this.changeLoc) return false;
      let viewPort = this.cm.getViewport()
      let changeLoc = this.changeLoc
      let viewFrom = viewPort.from
      let viewTo = viewPort.to
      let changeFrom = changeLoc.start
      let changeTo = changeLoc.end
      let inView = (line) => line > viewFrom && line < viewTo
      let inChange = (line) => line > changeFrom && line < changeTo
      console.log(viewFrom,viewTo, changeFrom,changeTo)
      return inView(changeFrom) || inView(changeTo) || inChange(viewFrom) || inChange(viewTo)
    }
    isInChange() {
      if(!this.changeLoc) return false
      let line =this.cm.getCursor().line
      return line > this.changeLoc.start && line < this.changeLoc.end 
      
    }
    
    makeChangeText(){
      let body = ["let change = () => {"]
      let getLine = (i) => this.cm.getLine(i)
      for(let key in this.bodyMap){
        let mapping = this.bodyMap[key]
        body.push(getLine(mapping.keyLoc))
        body.push("    {")
        for(let i = mapping.start; i <= mapping.end; i++ ){
          body.push(getLine(i))
        } 
        body.push("    }")
      }
      body.push("}")
      return body.join("\n")
    }
    replaceChange(changeLoc,newBody){
       let start = { line: changeLoc.start, ch: 0 }
       let end = {line: changeLoc.end, ch:null}
       let oldBody = this.cm.getRange(start, end)
       if(oldBody != newBody)
          this.cm.replaceRange(newBody, start,end)
    }
    //
  	inMap(map){
      
      let line = this.cm.getCursor(line)
      for( let key in map){
         let value = map[key]
         if( line >= value.start && line <= value.end ){
           return {line, key, value}
         }
      }
    }
  	blueLine(line) {
      this.cm.Logger.addBGClass(line, "lightBlue");
    }
    unBlueAll(line) {
      this.cm.Logger.removeBGClassAll("lightBlue");
    }
    showMaps(){
        this.clearLogs()
        this.unBlueAll()
        this.showMap(this.changeMap)
        this.showMap(this.bodyMap)
    }
    showMap(map){
        for(let key in map){
            let value = map[key]
            
            for(let i = value.start; i<=value.end; i++ ){
                this.logMessageAtLine(i, key)
              
            }
        }
    }
    clearMaps() {
      this.changeMap = {}
      this.bodyMap = {}
    }
    
    
    fixChangeMap(){
      for(let key in this.changeMap){
        let entry = this.changeMap[key]
        for(let i = entry.end; i > entry.start; i--){
          let line = this.cm.getLine(i)
          if(!line.trim) continue
          if(line.match(/\s*}/)){
            entry.end = i - 1;
            entry.start = entry.start + 1
          }
        }
      }
    }
    
  scanChange() {
      this.changeMap = {}
      let n = this.changeLoc.end
      let i = this.changeLoc.start
      for (; i < n; i++) {
        let startLine = this.cm.getLine(i)
        if(this.locationComment(startLine)){
           let start = i
           i += 2
           for (; i < n; i++) {
             let line = this.cm.getLine(i)
             if(this.locationComment(line)){
               this.makeChangeEntry(this.changeMap, 
                              startLine.trim(), start, start + 2, i - 2)
			   break
             }
           }
        }
      }
    }
  
  scanBody(i,n = this.cm.lineCount()){
      this.bodyMap = {}
      let endPattern = /\/\/end[:]?/
      for (; i < n; i++) {
        let startLine = this.cm.getLine(i)
        if(this.locationComment(startLine)){
           let start = i
           let startIndent = this.lineIndent(startLine)
           i++
           for (; i < n; i++) {
             let line = this.cm.getLine(i)
             let thisIndent = this.lineIndent(line)
             if(!line.trim()) continue
             if(this.locationComment(line) || 
                line.match(endPattern)
                ||
                thisIndent < startIndent ||
               (thisIndent === startIndent && line.trim() === "}")){
               this.makeChangeEntry(this.bodyMap, 
                            startLine.trim(), start, start + 1, i - 1)
               i--
			   break 
             }
           }
        }
      }
    }
  
  
    makeChangeEntry(map, key, keyLoc, start, end){
        //log(typeof map)
        if(!key) return;
        map[key] = {keyLoc, start: keyLoc+1,end}
    }
    lineIndent(line) {
        let matcher = line.match(/^(\s*)\S/)
        if(!matcher) return 0
        return matcher[1].length     }

    changeStart(line) {
        return line.match(/^let\s*change\s*=/)
    }
    changeEnd(line) {
        return line.match(/^}/)
    }
    locationComment(line) {
        let matcher = line.match(/^\s*\/\/(.*):\s*$/)
        if (matcher) return matcher[1]
        return null
    }
    
    setMappings(){
      let map1 = this.changeMap
      let map2 = this.bodyMap
      let mappings = []
      for(let key in map1){
        let val1 = map1[key]
		let val2 = map2[key]
        let i, j
        for(i = val1.start, j = val2.start; i < val1.end; i++, j++){
          mappings[i] = j;
          mappings[j] = i;
        }
      } 
      this.setLoggerMapping(mappings)
    } 
   
}
test()
