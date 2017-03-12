module.exports = (bs,req, res, next) =>
{


  try{
    // res.write(Object.keys(req).join(' '))
    req.allData = "REQ + <br> "  + Object.keys(req).join("<br>") + new Array(5).join("<br>")
  } catch (e) {
    req.allData = (e.toString())
  }
  return next();
}
