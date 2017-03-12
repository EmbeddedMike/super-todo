
app = (bs, req, res, next) => {
  // res.write(Object.keys(req).join('<br>'));
  // res.write(Object.keys(req).join(', '))
  const makeHTML =  ( stuff ) => `
  <html class="gr__localhost">
    <head>
    </head>
      <body >
        ${stuff}
      </body>
    </html>
  `

  res.write(makeHTML(req.allData + Object.keys(res).join("<br>")))
  res.end();
  setTimeout( () => bs.notify("This is a notification", 2000), 4000)
}

module.exports = app;
