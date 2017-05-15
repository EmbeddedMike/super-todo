console.clear()
let log = this.cm.Logger.log.bind(Logger)
Logger.logMessageAtLine = Logger.logMessageAtLine.bind(Logger)

let test = () => {
let L = this.cm.Logger;
let thisCM = this.cm
let onChange = (cm) => {
  console.log("change");
}
let onCursor = (cm) => {
  console.log(c.ChangeLoc)
  c.inChange()

  console.log("cursor");
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
  setTimeout(uncall, 5000) 
  cm.on(event, cb)
}

recall("cursorActivity", onCursor);
recall("change", onChange); 

let c = new Changer(this.cm)
console.log("STASRT")
let changeLoc = c.findChange()
console.log(c.changeLoc)
console.log(changeLoc)

c.scanBody(changeLoc.end + 1)
console.log(c.locationMap)
//c.replaceChange(changeLoc)
//c.setMappings() 
//c.showMaps()
//c.blueLine(4)

 
let change = ()=> {
              //endpattern:
    {
    }
    //end:


}
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

   sync(){
      	let mapping;
    	if(mapping = this.inMap(this.changeMap)){
          console.log("in change")
        } else if(mapping = this.inMap(this.locationMap)) {
          console.log("in location")
        }
    }
  	
    
  	findChange(){
      let getLine = (i) => this.cm.getLine(i)
      let n = this.cm.lineCount()
      console.log("FC",n)
      for(let i = 0; i < n; i++ ){
        if(getLine(i).match(/^let\s+change\s*=\s*\(\)=> {/)){
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
    inChange() {
      if(this.changeLoc){
            
        
        let line =this.cm.getCursor().line
        if(line > this.changeLoc.start && line < this.changeLoc.end ){
          this.cm.Logger.logMessageAtLine(line, "In change")
        } else {
          this.cm.Logger.logMessageAtLine(line, "Out change")
        }
      }
    }
    
    replaceChange(changeLoc){
      
      let body = ["let change = ()=> {"]
      let getLine = (i) => this.cm.getLine(i)
      for(let key in this.locationMap){
        let mapping = this.locationMap[key]
        body.push(getLine(mapping.keyLoc))
        body.push("    {")
        for(let i = mapping.start; i < mapping.end; i++ ){
          body.push(getLine(i))
        }
        body.push("    }")
      }
      body.push("    //end:")
      body.push("}")
      let newBody = body.join("\n")
      
     
      
      if(!changeLoc){
        this.cm.replaceRange(newBody, { line: 2, ch: 0 })
      } else {
        let start = { line: changeLoc.start, ch: 0 }
        let end = {line: changeLoc.end, ch:null}
        let oldBody = this.cm.getRange(start, end)
        if(oldBody != newBody)
            this.cm.replaceRange(newBody, start,end)
                             
      }
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
        this.showMap(this.locationMap)
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
      this.locationMap = {}
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
      let endPattern = /\/\/end[:]?/
      for (; i < n; i++) {
        let startLine = this.cm.getLine(i)
        if(this.locationComment(startLine)){
           console.log("found")
           let start = i
           let startIndent = this.lineIndent(startLine)
           i++
           for (; i < n; i++) {
             let line = this.cm.getLine(i)
             let thisIndent = this.lineIndent(line)
             if(!line.trim()) continue
             if(this.locationComment(line) || 
                //endpattern:
                line.match(endPattern)
                //end
                ||
                thisIndent < startIndent ||
               (thisIndent === startIndent && line.trim() === "}")){
               this.makeChangeEntry(this.locationMap, 
                            startLine.trim(), start, start + 1, i - 1)
               console.log(startLine, start,i)
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
      let map2 = this.locationMap
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
