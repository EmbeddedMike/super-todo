
app = (req, res, next) => {
  res.write("You are a real loser");
  res.end();
}

module.exports = app;
