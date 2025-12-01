const express = require("./src/express");
const app = express();

app.get("/users", (req, res, next) => {
  res.writeHead(200);
  res.write("Mock Users list");
  res.end();
});

app.post("/users", (req, res) => {
  res.writeHead(200);
  res.write("Creating user...")
  res.write("User created!");
  res.end();
});

// app.get("/about", (req, res) => {
//   res.writeHead(200);
//   res.write("About page");
//   res.end();
// });

// app.post("/about", (req, res) => {
//   res.write('Data from post :)');
//   res.end();
// });

app.listen(3000, () => {
  console.log("Example app listening at port 3000");
});
