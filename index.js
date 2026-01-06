const express = require("./src/express");
const app = express();

app.use("/assets", express.static("public"));

app.set("view engine", "ejs");

app.get("/user", (req, res, next) => {
  res.send({ id: 1, name: "John Doe" });
});

app.get("/user/:id", (req, res, next) => {
  const userId = 1;
  console.log("Route params: ", req.params);
  res.send({ id: userId, name: `User ${userId}` });
});

app.get("/users", (req, res, next) => {
  res.send([{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Smith" }]);
});

app.post("/users", (req, res) => {
  return res.status(201).send("Creating user...");
});

// app.get("/send-test", (req, res) => {
//   return res.sendFile("./public/index.html");
// });

// app.get("/send-test-fail", (req, res) => {
//   return res.sendFile("./public/doesnotexist.html");
// });

app.get("/render-test", (req, res) => {
  res.render("index.html", { title: "Test Render" });
});

app.get("/home", (req, res) => { 
  res.render("home", { title: "Home Page Test", heading: "Welcome to the Home Page",  message: "This is a simple message rendered using EJS template engine.",  items: ["Item 1", "Item 2", "Item 3"] });
});

app.get("/about", (req, res) => {
  return res.redirect("/user");
});


app.listen(3000, () => {
  console.log("Example app listening at port 3000");
});
