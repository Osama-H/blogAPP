const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./app");

const dataBase = process.env.DATA_BASE_URL;
mongoose.set("strictQuery", false);
mongoose
  .connect(dataBase, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DataBase Connected Succsefully");
  })
  .catch((err) => {
    console.log("There's An Error in DataBase Connection", err);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend Server Is Running on Port ${port}`);
});
