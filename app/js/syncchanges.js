console.clear()
let log = this.cm.Logger.log.bind(Logger)
Logger.logMessageAtLine = Logger.logMessageAtLine.bind(Logger)


let L = this.cm.Logger;

//log('here') 

let test = () =>{
  

let c = new Changer(this.cm)
console.log("STASRT")
let changeLoc = c.findChange()
console.log(changeLoc)
c.scanBody(changeLoc.end + 1)
console.log(c.locationMap)
c.setMappings() 
//c.showMaps()
//c.blueLine(4)




let change = ()=> {

 
}

}
//
//  
/*
0. Locate the change object, or create a new, empty one.
1. Detect when I've created a new location comment and create a new corresponding change key, and fill out a default (empty) body.
2. Detect when the cursor is in a location comment or within the body of a location comment (this will be true right after creating one), find the matching change key and make change key's body match the location comment's body
3. Detect when the cursor is in a change key and if it changes, then change the corresponding location comment
4. Detect when the cursor is in a change key's body, and change the location comment body to match
*/
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
              return {start,end: i}
            }
          }
        }
      }
      return null
        
    }
    
    createChange(){
      let body = ["let change = ()=> {"]
      let getLine = (i) => this.cm.getLine(i)
      for(let key in this.locationMap){
        let mapping = this.locationMap[key]
        body.push(getLine(mapping.keyLoc))
        body.push("    {")
        for(let i = mapping.start; i < mapping.end; i++ ){
          body.push(getLine(i))
        }
        body.push("    {")
      }
      body.push("}")
      return body.join("\n");
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
    scanSource() {
        this.clearMaps()
        let n = this.cm.lineCount()
        let iContinue = this.scanChange(n)
        this.scanBoth(this.locationMap, n, iContinue)
      	this.fixChangeMap()
    }
    scanChange(n) {
        for (let i = 0; i < n; i++) {
            let line = this.cm.getLine(i)
            if (this.changeStart(line)) {
                return this.scanBoth(this.changeMap, n, i + 1, "isChange")
            }
        }
        let colon = ':'
        let changeTemplate =
`let change = {
    //purpose${colon}
    //commit${colon}
    //end${colon}
}`
        //this.cm.replaceRange(changeTemplate, { line: 2, ch: 0 })
        return 2 + change.Template.split("\n").length
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
    //scanBody():  
    scanBody(i,n = this.cm.lineCount()){
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
             //console.log("indents", startLine, thisIndent, startIndent)
             if(!line.trim()) continue
             if(this.locationComment(line) || 
                thisIndent < startIndent ||
               (thisIndent === startIndent && line.trim() === "}")){
               console.log(i,line)
               this.makeChangeEntry(this.locationMap, startLine.trim(), start, i)
			   break
             }
           }
        }
      }
    }
  
    scanBoth(map, n, start, isChange) {
        
        let lastKey = null
        let lastStart = null
        let lastIndent = 0
        for (let i = start; i < n; i++) {
            let line = this.cm.getLine(i)
            let nextIndent = this.lineIndent(line)
            let nextKey = null
            if (this.locationComment(line)) {
                this.makeChangeEntry(map, lastKey, lastStart, i - 1)
                nextKey = line.trim()
                if (nextKey.match(/\/\/end/)){
                    return i
                }
                lastKey = nextKey
                lastStart = i
                lastIndent = nextIndent
            } else if (lastIndent != null && nextIndent < lastIndent) {
                this.makeChangeEntry(map, lastKey, lastStart, i - 1)
                lastKey = null
                lastStart = null
                lastIndent = null
            } else if(isChange && line.trim() && nextIndent === 0){
            	this.makeChangeEntry(map, lastKey, lastStart, i - 1)
                return i
            }
        }
        this.makeChangeEntry(map, lastKey, lastStart, n-1)
    }
    makeChangeEntry(map, key, keyLoc, end){
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
