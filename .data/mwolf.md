# Newest
Ctrl-F to make the search persistent.
Make the search incremental
[Dummy's guide to Redux Thunk](https://medium.com/@stowball/a-dummys-guide-to-redux-and-thunk-in-react-d8904a7005d3)
[Redux Js Async actions](http://redux.js.org/docs/advanced/AsyncActions.html)
Sometimes save action fails #GTDFlowBug
[Structor Documentation](https://github.com/ipselon/structor/blob/master/docs/README.md)
[Phenomic](https://phenomic.io/showcase/)
[Gatsby React Web Hosting](https://github.com/gatsbyjs/gatsby)
Parse MarkDown links and render/undrender them
[Custom domain with Github pages](https://help.github.com/articles/using-a-custom-domain-with-github-pages/)
[Github pages](https://pages.github.com)
[NGrok tunnels to localhost](https://ngrok.com/product)
[The Moral Animal](https://www.amazon.com/Robert-Wright/e/B000AP9O2U/ref=dp_byline_cont_book_1)

// this 
Example with a #er??
//some stuff
# configstart
console.log("YAY")

_this.deleteNode  = (node) => {
  
}

_this.deleteLogs = () => {
  let logs = document.getElementsByClassName("logdata")
  let list = []
  let log;
  for(log of logs){
    list.push(log)
  }
  while(log = list.pop()){
    
    
    log.parentElement.removeChild(log)
  }
  
}

_this.log = (text) =>{
  _this.widgets = []
  let line = _this.cm.getCursor().line
 
  let ch = _this.cm.getLine(line).length
  // let pixel = _this.cm.charCoords({line, ch: null})
  let node = document.createElement("span")
  node.innerHTML = text
  node.className = "logdata";
  
  let widget = _this.cm.addWidget({line: line,ch: ch}, node)
  
  setTimeout( () => node.parentElement.removeChild(node), 1000 );
}

_this.deleteLogs()

_this.compressMarkup = () =>{
    _this.log("Stuff goes here");
  
}

_this.cursorActivityOff = false
BaseCodeMirror.defineMode("simplemode", function(config) {
  return BaseCodeMirror.multiplexingMode(
    BaseCodeMirror.getMode(config, "GTDFlow"),
    {open: "# configstart",
     close: "# " + "configend",
     mode: BaseCodeMirror.getMode(config, "text/javascript"),
     delimStyle: "delimit"}
    // .. more multiplexed styles can follow here
  );
});
/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */
 console.log("FOLD", BaseCodeMirror.fold)
console.log("This is", _this)
_this.testFunction = (param) => {
  console.log("THE TEST IS NOT", param);
  }

BaseCodeMirror.defineSimpleMode("GTDFlow", {
  // The start state contains the rules that are intially used
  start: [
     {regex: /\s*#.*$/, token: "header", sol: true},
     {regex: /\/\*/, token: "comment", next: "comment"},
     {regex: /\/\/.*/, token: "comment"},
     {regex: /([\w\s])+/, token: "normal"},
     {regex: /([#@]\w+\?)/, token: "error"},
     {regex: /(@\w+)/, token: "context"},
     {regex: /(#\w+)/, token: "category"},
     {regex: /(\[.*\])/, token: "markdownlink", next: "linktarget"},
     
     
  ],
  // The multi-line comment state.
  linktarget:[
    {regex: /(\(.*\))/, token: "markdowntarget", next: "start"},
    {regex: /.*/, token: "error", next:"start"}
    ],
  comment: [
    {regex: /.*?\*\//, token: "comment", next: "start"},
    {regex: /.*/, token: "comment"}
  ],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//",
    fold: "indent"
  }
});

# configend

# IN



# Bugs  

# Daily
  Plan
  750 words
  Recumbent
  Yoga
  Clear Inbox
  Meditation
  Exercise
  Close Tabs
  Yoga
  Post
  Photograph
  Forgiveness
  Gratitude
  EOD Review




# Next
Example with a #next
	Resubmit proposal for Colloquy
# @Phone
Example with @phone

# @Read
@Read "Viking Economics"


# Waiting
Move dock #waiting
Taxes accepted #Done
* Share Doc with JSG
* Cancel Hulu @1May2017?
Callback from big jay

# Tired
Process all the stuff in my Inbox todo list

## Email

* Email Murnik re bus

# Projects
# someshit
a task that did not exist #someshit

## GTDFlow
Abbreviations to work with lower case

## GTDFlowCosmetic
Format input box
Expand size of list
Prompt for input box
Move focus to document when read succeeds

##GTDFLowFunctions
Add Search ability
Add folding to everything
Save on timer #GTDFlow
Automatically fold and unfold
Saving box when saving
* add MoveUp/Down and Mark Done keys
* add Ctrl-K and hyperlinks

* add  current todo list to local storage 
Hide and show selected sections
Command at top to render a view
Conditionally hide the diagnostic panel #GTDFlow
Make editing screen larger #GTDFlow
Add "Saving" while saving #GTDFlow
Check into serviceworker.js fails to work #GTDFlow
Prompt with tags when #
Add table at top
* create a REST interface so that I can push/pull the list from glitch. That will let me work from all devices.
* add @context #project.project and automatic sorting (when leaving the line)

## Writing
https://en.wikipedia.org/wiki/Metafiction

Livejournal
https://plus.google.com/u/0/105641292683040395669/posts/56k8nHo89Dq?cfem=1

Javascript Modules all [about](https://medium.freecodecamp.com/javascript-modules-a-beginner-s-guide-783f7d7a5fcc)


### dev.ed

React Training [course](https://online.reacttraining.com/courses/50507/lectures/2466461#/questions/1)
Javascript Modules all [about](https://medium.freecodecamp.com/javascript-modules-a-beginner-s-guide-783f7d7a5fcc)
Quokka https://quokkajs.com/docs/index.html
Lifting state up in React https://facebook.github.io/react/docs/lifting-state-up.html
Continue Abramov course (https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch?series=getting-started-with-redux)
React Hot loader 
https://github.com/gaearon/react-hot-loader/pull/240
https://github.com/gaearon/react-hot-boilerplate/pull/61
Gearon HMR Medium post https://medium.com/@dan_abramov/hot-reloading-in-react-1140438583bf
Troubleshooting https://github.com/gaearon/react-hot-loader/blob/master/docs/Troubleshooting.md
Learn how HMR works
* Learn Glamourous #dev.ed
* Learn Quokka #dev.ed
* Learn Wallaby #dev.ed
* VS Code terminal [tutorial](http://www.growingwiththeweb.com/2017/03/mastering-vscodes-terminal.html) Daniel Imms #dev.ed
* Code Sandbox #dev.ed
* Learn [ripgrep](https://github.com/BurntSushi/ripgrep) #dev.ed 
* React DnD
Code Splitting with [React](https://hackernoon.com/code-splitting-for-react-router-with-webpack-and-hmr-bb509968e86f)
React Datasheet [github](https://github.com/nadbm/react-datasheet)

####Identity

Fix github profile
https://github.com/settings/profile
#### Reading
Julia Cameron article [NYMag](http://nymag.com/thecut/2016/04/julia-cameron-the-artists-way.html)
Read Anathem
NPR report on health [here](http://www.npr.org/sections/health-shots/2017/04/10/523005353/how-u-s-health-care-became-big-business)

## ToDo
* Listen to Serial
* push to glitch #done

## Taxes
* Review Taxes
* Print Taxes
* Send

##Home
Cut up tree

## CabinetDoor
* Research
* Touch up doors

## ScottWeb
* Email Scott

## Blog
### GTD
* Environments for working
* ([Search](https://www.blogger.com/blogger.g?blogID=809323243837962619#editor/target=post;postID=5522088582160978153) 
* [Blogger](https://www.blogger.com/blogger.g?blogID=809323243837962619#editor/target=post;postID=5522088582160978153))
* [Sample](http://codepen.io/iamscottcox/pen/jVMzJR)
* [Vader](http://codepen.io/ghoch/pen/yeqKmm)
* [CodeMirror](https://github.com/JedWatson/react-codemirror/tree/master/example/src)

### People
* [Buster Benson](http://busterbenson.com/)

### VS Code
* [Debug example](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
* Post question about debug scripts
[Learn VS Code tips and tricks](https://github.com/Microsoft/vscode-tips-and-tricks#debugging)
[Macros for VSCode](https://github.com/geddski/macros)

#Gitglitch

* Add commit logic
* Add clone in logic
* Figure out how to control it

Create a “clone-project” script that does a git clone, cd, npm-install, code.

# Blog
* Learning code by debugging it
* Law and Code

# Someday
Find about Codemirror snippets #Someday
Email Tim Seely

Email Hendrik
Email Andrew at Poliquin's office
Email Hendrik
Email Andrew at Poliquin's office
Move stuff from LiveJournal
6 Second rule
Change Linux login screen
Vacuum shit from car
Get new charger for dustbuster
Take old car vac to recycle
Read YZ article on Chosen People [here](https://medium.com/@yonatanzunger/a-chosen-people-3c4a1366b867)


** Macros for VS Code
** Own version of VSCode


* Add Git commit to Git
#Read VS [Code debug docs](https://code.visualstudio.com/docs/nodejs/nodejs-debugging) 
* ([Child Process Debug](https://github.com/fastest963/child-process-debug))
*[Child Process](https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options))
* Document VS Code Attach to process
* Investigate VS Code Macros
* Clean up Glitch projects
* Look at Codepen Projects
* [Set up NVM](https://github.com/creationix/nvm)
* [Webpack Plugins](https://webpack.js.org/plugins/)
* Review [Webpack Resources](https://webpack.js.org/plugins/)
* [NPM Check Updates](https://www.npmjs.com/package/npm-check-updates)
* [Storybook Support](https://github.com/insin/getstorybook)
* [NPM GUI](https://github.com/q-nick/npm-gui)
* Investigate DraftJS 
* [here](https://dev.to/ben/this-blog-post-was-written-using-draftjs)
* [here](https://medium.com/@rajaraodv/why-draft-js-and-why-you-should-contribute-460c4a69e6c8#.gwwmy3t0s)
* Mozilla Debugger.html 
* [website](https://devtools-html.github.io/debugger.html/)
* [git](https://github.com/devtools-html/debugger.html)
* HMR with react 
* [here](http://matthewlehner.net/react-hot-module-replacement-with-webpack/) 
* [here](https://medium.com/@rajaraodv/webpack-hot-module-replacement-hmr-e756a726a07#.kdr3hcfe3)
* [HMR server side](https://github.com/webpack/docs/issues/45)




# Someday/Maybe
* Investigate [Chakracode](https://github.com/nodejs/node-chakracore/releases)
* Investigate [NVS](https://github.com/jasongin/nvs) 
* File error report for NVS
* Check out [example](https://github.com/jasongin/nvs)
* Wired article on Chris Fuchs [and Quantum Reality](https://www.wired.com/2015/06/private-view-quantum-reality/) 
* [(Quantum Realism paper)](http://thephysicalworldisvirtual.com/)
* Watch video: the emperor’s new genes
* Awesome list of JS Must-watch videos
* Read Brave web broswer
* Polymer playground
* Finish Our Mathematical Universe
* Facebook book idea
* Check out broadcast/recording/editing video
* Improve typing speed (app for that)
* Android for bobbi
* Victor Frankl ([Ted](https://www.ted.com/talks/viktor_frankl_youth_in_search_of_meaning))


# Done
* commit and push to glitch again #Done
Server to get todo list from .data #done
** 4. and server to store todo list in .data #done
Move tagged items when moving off the line #Done
Add reducer to change name in state #Done
Remove large "GTD List" **title** #Done
Hook CtrlS and save GTD list #Done
Add user name to state #Done
** 3. client to push todolist to server #done
** 2. client to request todolist from server #done
Check schedule on awninng #Done
Make Devtools replay work #Done
Check colloquys #done
Get Future perfect #done
Get paint #Done
Push project out to Glitch and make it work #done
Mail taxes #Done
Write Kellianne
Email Murnik
Organize list
Email: Finley
Back up Turbotax
Set up Dropbox
Email: reply to colloquy (temp)
Email: Write Kaya
Web: Order HDMI mini adapter
Web: Order Circumin
Web: Order Gourmesso
Web: Check Personal IFS book
Web: Send link to Harri# s Harari talk
Rough out website
Set up Krita to launch
Phone: Andrew’s email address
Send email to Andrew
Email Catherine
Post BL notes
Town meeeting
Publish beyond labels notes
Web: Upload photos @library


Write Mitchell
Do IRS Scam video
Write follow up emails
Finish VS Code parent child example (Git repo)
Post BL re Scott
Check Glitch community
Research Psychology of Trust
Write Psychology of trust
Write to Nico on schedule
Extend daily items on list
Read GTD in 15 minutes

1 April
Meditate
750 words
Clear inbox
Clear tabs
Exercise
Yoga
Take down cabinets
Read worst advice article
Read best time to be innovating article
Write Daniel Phone
Resign from Colloquy
Remove errors from taxes (Working!!!!!!!)
Unsubscribe from Monetize


Show Up for Healthcare
Put back cabinet doors
Recover home drive
Publish VS Code Example
Blog requirements for GTD app
Upgrade Linux
* Change old todo list to Markdown #done
* Clean unnecessary code #done
* [Push to super-todo](https://github.com/EmbeddedMike/super-todo) #done
* Look up BH school folks #done
* Cancel Hulu #done
Check size for awning
Order sundowner
https://www.sunsetterflagpole.com/costconew/order_awning.asp?model=m&extpromo=U
John Greenland (jsgjnr@gmail.com)
Costco member #111843593497
John • Tue, 6:11 PM
* Order new bathroom fan timer #done
* refactor server for hot reloading #done
Add patent pending to Scott #done
Send taxes
# Deleted