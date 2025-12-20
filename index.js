const express = require("./src/express");
const app = express();

app.get("/user", (req, res, next) => {
  res.send({ id: 1, name: "John Doe" });
});

app.get("/users", (req, res, next) => {
  res.send([{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Smith" }]);
});

app.post("/users", (req, res) => {
  return res.status(201).send("Creating user...");
});


app.get("/about", (req, res) => {
  return res.redirect("/user");
});


app.listen(3000, () => {
  console.log("Example app listening at port 3000");
});
