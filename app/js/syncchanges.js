
let endPattern = /\/\/end[:]?/
export default class Changer {
    constructor(cm) {
        this.cm = cm
        let Logger = cm.Logger
        this.clearLogs = Logger.clearLogs.bind(Logger)
        this.logMessageAtLine = Logger.logMessageAtLine.bind(Logger)
        this.setLoggerMapping = Logger.setMapping.bind(Logger)
        this.clearMaps()
    }
    
    findChange() {
        let getLine = (i) => this.cm.getLine(i)
        let n = this.cm.lineCount()

        for (let i = 0; i < n; i++) {
            if (getLine(i).match(/^\s*\/\*\s*changes\s*/)) {
                let start = i;
                for (i++; i < n; i++) {
                    console.log(getLine(i))
                    if (getLine(i).match(/^\s*endchanges\s*\*\//)) {
                        return this.changeLoc = { start, end: i }
                    }
                }
            }
        }
        this.cm.replaceRange("/* changes\n\nendchanges */\n",{line:2,ch:0})
        return this.findChange()
    }
    isChangeVisible() {
        if (!this.changeLoc) return false;
        let viewPort = this.cm.getViewport()
        let changeLoc = this.changeLoc
        let viewFrom = viewPort.from
        let viewTo = viewPort.to
        let changeFrom = changeLoc.start
        let changeTo = changeLoc.end
        let inView = (line) => line > viewFrom && line < viewTo
        let inChange = (line) => line > changeFrom && line < changeTo
        console.log(viewFrom, viewTo, changeFrom, changeTo)
        return inView(changeFrom) || inView(changeTo) || inChange(viewFrom) || inChange(viewTo)
    }
    isInChange() {
        if (!this.changeLoc) return false
        let line = this.cm.getCursor().line
        return line > this.changeLoc.start && line < this.changeLoc.end

    }

    makeChangeText() {
        let body = ["/* changes"]
        let getLine = (i) => this.cm.getLine(i)
        for (let key in this.bodyMap) {
            let mapping = this.bodyMap[key]
            let indent = this.lineIndent(getLine(mapping.start))
            body.push(new Array(mapping.indent).join(" ") + getLine(mapping.keyLoc))
            for (let i = mapping.start; i <= mapping.end; i++) {
                body.push(getLine(i))
            }
        }
        body.push("endchanges */")
        return body.join("\n")
    }
    replaceChange(changeLoc, newBody) {
        let start = { line: changeLoc.start, ch: 0 }
        let end = { line: changeLoc.end, ch: null }
        let oldBody = this.cm.getRange(start, end)
        if (oldBody != newBody)
            this.cm.replaceRange(newBody, start, end)
    }
    //
    inMap(map) {

        let line = this.cm.getCursor(line)
        for (let key in map) {
            let value = map[key]
            if (line >= value.start && line <= value.end) {
                return { line, key, value }
            }
        }
    }
    blueLine(line) {
        this.cm.Logger.addBGClass(line, "lightBlue");
    }
    unBlueAll(line) {
        this.cm.Logger.removeBGClassAll("lightBlue");
    }
    showMaps() {
        this.clearLogs()
        this.unBlueAll()
        this.showMap(this.changeMap)
        this.showMap(this.bodyMap)
    }
    showMap(map) {
        for (let key in map) {
            let value = map[key]

            for (let i = value.start; i <= value.end; i++) {
                this.logMessageAtLine(i, key)

            }
        }
    }
    clearMaps() {
        this.changeMap = {}
        this.bodyMap = {}
    }


    fixChangeMap() {
        for (let key in this.changeMap) {
            let entry = this.changeMap[key]
            for (let i = entry.end; i > entry.start; i--) {
                let line = this.cm.getLine(i)
                if (!line.trim) continue
                if (line.match(/\s*}/)) {
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
            let startIndent = this.lineIndent(startLine)
            if (this.locationComment(startLine)) {
                let start = i
                i += 1
                for (; i <= n; i++) {
                    let line = this.cm.getLine(i)
                    let thisIndent = this.lineIndent(line)
                    //console.log(line)
                    if (this.locationComment(line) ||
                        line.match(endPattern)
                        ||
                        (thisIndent === startIndent && line.trim() === "}")
                        ||
                        thisIndent < startIndent){
                        this.makeChangeEntry(this.changeMap,
                            startLine.trim(), start, start + 1 , i - 1)
                        break
                    }
                }
            }
        }
       
    }

    scanBody(i=this.changeLoc.end, n = this.cm.lineCount()) {
        this.bodyMap = {}
        
        for (; i < n; i++) {
            let startLine = this.cm.getLine(i)
            if (this.locationComment(startLine)) {
                let start = i
                let startIndent = this.lineIndent(startLine)
                i++
                for (; i < n; i++) {
                    let line = this.cm.getLine(i)
                    let thisIndent = this.lineIndent(line)
                    if (!line.trim()) continue
                    if (this.locationComment(line) ||
                        line.match(endPattern)
                        ||
                        thisIndent < startIndent ||
                        (thisIndent === startIndent && line.trim().match(/^}/))) {
                        let end = i - 1;
                        if((thisIndent === startIndent && line.trim().match(/^}/))) end++ 
                        while(!this.cm.getLine(end).trim()) end--
                        this.makeChangeEntry(this.bodyMap,
                            startLine.trim(), start, start + 1, end)
                        
                        i--
                        break
                    }
                }
            }
        }
    }


    makeChangeEntry(map, key, keyLoc, start, end) {
        //log(typeof map)
        if (!key) return;
        map[key] = { keyLoc, start: keyLoc + 1, end }
    }
    lineIndent(line) {
        let matcher = line.match(/^(\s*)\S/)
        if (!matcher) return 0
        return matcher[1].length
    }

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

    setMappings() {
        let map1 = this.changeMap
        let map2 = this.bodyMap
        let mappings = []
        for (let key in map1) {
            let val1 = map1[key]
            let val2 = map2[key]
            let i, j
            for (i = val1.start, j = val2.start; i < val1.end; i++ , j++) {
                mappings[i] = j;
                mappings[j] = i;
            }
        }
        this.setLoggerMapping(mappings)
    }

}

/*
//console.clear()
let L = this.cm.Logger;
let thisCM = this.cm
let Changer = exported.Changer

let c = new Changer(this.cm)
let change = () => {
  //onchange:
  { 
    let onChange = (cm) => {
        //these are tests!!! !!
        bothFunction(cm)
    }
  }
  //end 
}

let bothFunction = (cm) => {
    let changeLoc = c.findChange()
    if (false && !c.isInChange()) {
        if (!changeLoc) changeLoc = { start: 2, end: 2 }
        console.log("changeloc", changeLoc)
        c.scanBody(changeLoc.end)
        if (changeLoc) {
            console.log("bodyMapping", c.bodyMap);
            let changeText = c.makeChangeText();
            console.log(changeText)
            c.replaceChange(changeLoc, changeText)
        } 
    } else {
        c.findChange() 
        console.log(c.changeLoc) 
        c.scanChange()
        console.log("CHANGEMAP", c.changeMap) 
        c.scanBody(c.changeLoc.end)
        c.replaceCorresponding() 
    } 
  
}  
//onchange:
    let onChange = (cm) => {
        //these are tests
        bothFunction(cm)
    }
  
   //more 
//end 
let onCursor = (cm) => {

}

let debounce = exported.debounce
onChange = debounce(onChange, 100);
onCursor = debounce(onCursor, 100);
let recall = (event, cb) => {
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


let patch = { 
    replaceCorresponding(){
      console.log("REPLACE", this.changeMap);
      for(let key in this.changeMap) {
        console.log("KEY", key);
        let change = this.changeMap[key]
        let body = this.bodyMap[key]
        let n = change.end - change.start + 1
        let newStuff = this.cm.getRange({line:change.start + 1, ch:0}, 
                                        {line:change.end - 1, ch:null});
        let oldStuff = this.cm.getRange({line:body.start, ch:0}, 
                                        {line:body.end, ch:null})
        console.log(change,body)
        console.log("OLD",oldStuff)
        console.log("NEW", newStuff) 
        
      }
    }
}
c.replaceCorresponding = patch.replaceCorresponding.bind(c);



 
*/