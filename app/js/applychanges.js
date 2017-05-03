//console.log(GDTEditor, CodeEditor)
console.log("AT THE TOP");
//return; //this
let resetTime = 5000
if(this.restoreExtensions){
  console.log("CLEARING");
  clearTimeout(this.restoreExtensions)
  this.restoreBoth();
}
let allChanges = {
  CodeEditor: {
    original: CodeEditor,
    changes: {
        modChange: throttle((cm) => {
          console.log("CHANGE");
          this.clearErrors()
          this.saveCode();
          //setTimeout( this.clearError.bind(this), 2000)
          
        },2000),
        clearErrors(){
          console.log("Clear");
          let logs = document.getElementsByClassName("errormessage");
		  for(let log of logs) log.parentElement.removeChild(log)
        },
    	showError(e){
          console.log("error!!!!!");
          let eLine = e.stack.split("\n")[0];
          console.log(eLine);
          let matcher = eLine.match(/^(.*):\s(.*):(.*)\((\d+):(\d+)/)
          if( matcher ) {
            let message = matcher[1] + " " + matcher[3]
            let line = +matcher[4]
            let ch = +matcher[5]
			let node = document.createElement("span")
            node.innerHTML = message
            node.className = "errormessage";
            console.log(ch + line)
		    let widget = this.cm.addWidget({ line: line, ch: ch }, node)
          }
        },
  		actuallyMoved() {
    	   console.log("New one");
  	    }
    },
    old: {}
  }
}

let changeExtension = (entry, method) => {
   entry.old[method] = entry.original[method]
   entry.original[method] = entry.changes[method]
}

let restoreExtension = (entry, method) => {
  if(entry.old[method]) entry.original[method] = entry.old[method]
}

let doExtension = (name, fn) => {
 let entry = allChanges[name]
 if(!entry) return;
 
 for( let method of Object.keys(entry.changes) ) {
   fn( entry, method)
 }
}

let restoreForName = (name) => {
  doExtension(name, restoreExtension)
  console.log("Restored " + name)
}
let restoreBoth = () => {
  this.restoreExtensions = null;
  this.clearErrors();
  restoreForName("CodeEditor")
  restoreForName("GDTEditor")
}

this.restoreBoth = restoreBoth
this.restoreExtensions = setTimeout( restoreBoth,resetTime)

doExtension( "CodeEditor", changeExtension);
doExtension( "GDTEditor", changeExtension);
