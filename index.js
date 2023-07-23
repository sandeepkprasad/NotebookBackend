const connectToDB = require("./db.js");
const express = require("express");
const cors = require("cors");

connectToDB();

const app = express();
app.use(express.json());
app.use(cors());
const port = 5000;

//Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`App is listening on port http://localhost:${port}`);
});
