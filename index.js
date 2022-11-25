const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yalqvm0.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    app.get("/category", async (req, res) => {
      const AllCategory = client.db("mobileHut").collection("AllCategories");
      const query = {};
      const options = await AllCategory.find(query).toArray();
      res.send(options);
    });
  } finally {
  }
}
run();
app.get("/", async (req, res) => {
  res.send("Mobile Hut Server Runnin");
});
app.listen(port, () => console.log(`Mobile Hut Server Running on ${port}`));
