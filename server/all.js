
module.exports = (bs,req, res, next) =>
{
  try{
    // res.write(Object.keys(req).join(' '))
    req.allData = "SUPER DOOPER + <br> "  + Object.keys(req).join("<br>") + new Array(5).join("<br>")
  } catch (e) {
    req.allData = (e.toString())
  }
  return next();
}
module.exports.deregister = () => {
  console.log("Deregister")
}

module.exports.register = (bs) => {
    console.log("Register");
    bs.reload()
}
