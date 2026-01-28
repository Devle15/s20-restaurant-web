const express = require("express");
const app = express();

app.use(express.json());

// 👉 Serve toàn bộ frontend
app.use(express.static("login"));
app.use(express.static("staff"));
app.use(express.static("assets"));
app.use(express.static("components"));
app.use(express.static("chef"));

app.use(express.static("."));     

app.listen(5050, () => {
  console.log("Server running at http://localhost:5050");
});
