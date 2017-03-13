let state = {}
console.log("\n\nloaded")
module.exports = (bs,req, res, next) =>
{
  if (req.originalUrl === "/service-worker.js") {
    return next();
  }
  try{
    // res.write(Object.keys(req).join(' '))
    // req.allData = "SUPER DOOPER + <br> "  + Object.keys(req).join("<br>") + new Array(5).join("<br>")
    req.allData = '<div style="color: red"> NOT' + (state.originalUrl = req.originalUrl) + '</div>'

  } catch (e) {
    req.allData = (e.toString())
  }
  console.log("Nav to " + state.originalUrl);

  return next();
}
module.exports.deregister = () => {
  console.log("Deregister " + state.originalUrl )
  return state;
}

module.exports.register = (bs, newState) => {
    state = newState;
    console.log("Register: " + state.originalUrl);
    if(state.originalUrl === "/api") {
      bs.reload()
    }
}
