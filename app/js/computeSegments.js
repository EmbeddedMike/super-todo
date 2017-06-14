//Segment  name: todo
/*

change duplicate name problem
restore cursor after Ctrl-S
Restore after HMR
New search box that hides unmatched lines

fix bug with `` ``

*/
//Segment  name: body
/*
Refactor compileAndRun so that

*/


//Segment  name: second


console.clear()
console.log("NOSEGxy")
//Segment  name: test, compile:true
console.log("TESTED")

//Segment  name: main compile:true
//Compute an immutable map of segments matching the pattern /^(\/\/Segment\b.*$)
//Each entry has a name and a set of attributes.
//If compile:true is set, then the segment will be compiled normally
//If compile: false is set, the segment will not be compiled
//If compile: "<plugin>" it will be compiled with the named plugin
console.log("MAIN")
let segmentPattern = /(^\/\/Segment\b.*\n)/gm
export default class SegMapper {
  constructor(codeEditor) {
    this.codeEditor = codeEditor
    this.cm = codeEditor.cm
    this.oldMap = codeEditor.segMap || {}
    codeEditor.compileSegments = this.compileSegments.bind(this)
  }
  toSegments() {
    let code = this.cm.getValue()
    let segments = code.split(segmentPattern)

    if (segments[0].trim() === "")
      segments.shift()
    if (!segments[0].match(segmentPattern)) {
      let newSeg = '//Segment  name: undefined, compile:false\n'
      segments.unshift(newSeg)
      this.cm.replaceRange(newSeg, { line: 0, ch: 0 })

    }
    let text = segments.join("")
    this.segments = segments
  }
  toMap() {
    this.segMap = null
    let segMap = {}
    let segments = this.segments
    let line = 0
    for (let i = 0; i < segments.length; i += 2) {
      let args = segments[i].substring(10)
      let pattern = /\s*(\w*)\s*:\s*(\w*)/g
      let match = pattern.exec(args)
      let tokens = []
      while(match){
        tokens.push(match[1])
        tokens.push(match[2])
        match = pattern.exec(args)
      }
      let entry = {}
      let name
      
      for (let j = 0; j < tokens.length; j += 2) {
        let key = tokens[j]
        let value = tokens[j + 1]
        entry.code = segments[i + 1]
        entry.offset = line + 1
        if (key === "name") {
          name = value.trim()
        } else {
            entry[key] = value
        }
      }
      if (name === "undefined") {
        this.cm.Logger.logErrorAtLine(line, "Name is Undefined")
        return
      } else if (segMap[name]) {
        
        this.cm.Logger.logErrorAtLine(line, "Duplicate name")
        return
      }
      segMap[name] = entry
      line += segments[i + 1].split("\n").length
      
    }
    this.segMap = segMap

  }
  compileChanges() {
    //IF editor console.log("COMPILES5")
    this.oldMap = this.codeEditor.segMap || {}
    for(let segName in this.segMap){
      let entry = this.segMap[segName]
      if(entry.compile) {
        let oldEntry = this.oldMap[segName]
        if(! oldEntry || entry.code !== oldEntry.code){
          this.codeEditor.compileAndRun(entry.code, entry.offset, true)
        }
      }
    }
    this.codeEditor.segMap = this.segMap
  }
  compileSegments() {
    this.toSegments()
    this.toMap()
    this.compileChanges()
  }
}
//IF editor let s = new SegMapper(this)
//turn on compile with NEWCOMPILE


