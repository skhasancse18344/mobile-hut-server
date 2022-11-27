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
    const AllCategory = client.db("mobileHut").collection("AllCategories");
    const AllProducts = client.db("mobileHut").collection("AllProducts");
    const userCollection = client.db("mobileHut").collection("users");
    const bookingCollection = client.db("mobileHut").collection("bookings");

    app.get("/category", async (req, res) => {
      const query = {};
      const options = await AllCategory.find(query).toArray();
      res.send(options);
    });
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { categoryId: id };
      const products = await AllProducts.find(query).toArray();
      res.send(products);
    });

    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await AllProducts.insertOne(products);
      res.send(result);
    });

    //User Entry on Database
    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user?.email };
      const alreadyUserExist = await userCollection.find(query).toArray();

      if (alreadyUserExist.length) {
        return res.send({ acknowledged: false });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/allusers", async (req, res) => {
      const query = {};
      const allUser = await userCollection.find(query).toArray();
      res.send(allUser);
    });

    //Booking
    app.post("/bookings", async (req, res) => {
      const booking = req.body;

      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });
    app.get("/mybookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { buyerEmail: email };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });
  } finally {
  }
}
run();
app.get("/", async (req, res) => {
  res.send("Mobile Hut Server Runnin");
});
app.listen(port, () => console.log(`Mobile Hut Server Running on ${port}`));
