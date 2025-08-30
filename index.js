const express = require("./src/express");
const app = express();

app.get("/", (req, res) => {
  res.writeHead(200);
  res.write("Hello world from custom express");
  res.end();
});

app.listen(3000, () => {
  console.log("Example app listening at port 3000");
});
