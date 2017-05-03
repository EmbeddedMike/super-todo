for (let q = 0; q < 10; q++)
    CL(q)
let bar = () => {
    CL("in bar");
}
//foo()
//return;
let sourceOffset = 0

let getSource = () => {
    sourceOffset = getCallerLine(0);
    return `
() => {
CL("Source offset is " + sourceOffset)

let fooX = () => {
CL("IN FOOX")
barX();
}

let barX = () => {
CL("IN BARX")
	foo();
}
fooX()
}
`}

try {
    let output1 = Babel.transform(getSource(),
        {
            // plugins: ['lolizer'], 
            presets: [["es2015", { modules: false }],
                "react"],
            sourceMap: "both",
            compact: false,
            filename: "inner",
            //inputSourceMap: output.map,
            sourceMapTarget: "thisfile.js",


        },
    )
    try {
        console.log(output1.map.sources)
        let code = eval(output1.code);

        addSourceMap(output1.map, sourceOffset);
        code();
    } catch (e) {
        console.log(e)
    }

} catch (e) {
    console.log("Error")
    if (this.showError) this.showError(e)
    console.log(e)
}
L.showData()
