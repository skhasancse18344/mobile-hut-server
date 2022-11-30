const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { query } = require("express");
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

// function varifyJWT(req, res, next) {
//   //   console.log("Token inside verifyJWT", req.headers.authorization);
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send("Unauthorized Access");
//   }
//   const token = authHeader.split(" ")[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//     if (err) {
//       res.status(403).send({ message: "Forbidden Access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }
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
    // app.get("/jwt", async (req, res) => {
    //   const email = req.query.email;

    //   const query = { email: email };
    //   //   console.log(query);
    //   const user = await userCollection.findOne(query);

    //   if (user) {
    //     const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
    //       expiresIn: "10h",
    //     });
    //     return res.send({ accessToken: token });
    //   }
    //   res.status(403).send({ accessToken: "" });
    // });
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
    app.get("/allseller", async (req, res) => {
      const query = { userType: "seller" };
      const allUser = await userCollection.find(query).toArray();
      res.send(allUser);
    });
    app.get("/allbuyer", async (req, res) => {
      const query = { userType: "buyer" };
      const allUser = await userCollection.find(query).toArray();
      res.send(allUser);
    });
    app.get("/usersVar/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const allUser = await userCollection.findOne(query);
      console.log(allUser);
      res.send(allUser);
    });
    app.get("/allusers/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const option = await userCollection.findOne(query);

      res.send(option);
    });
    app.put("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc, option);
      res.send(result);
    });
    app.put("/users/noadmin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "adminRemoved",
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc, option);
      res.send(result);
    });
    app.put("/users/varify/:email", async (req, res) => {
      const email = req.params.email;

      const filter = { email: email };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          varification: "Varified",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc, option);
      res.send(result);
    });
    app.put("/users/unvarify/:email", async (req, res) => {
      const email = req.params.email;

      const filter = { email: email };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          varification: "Unvarified",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc, option);
      res.send(result);
    });
    app.delete("/users/delete/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    //Booking
    app.post("/bookings", async (req, res) => {
      const booking = req.body;

      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });
    app.get("/dashboard/mybookings/:email", async (req, res) => {
      const email = req.params.email;

      const query = { buyerEmail: email };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    //My Product

    app.get("/myproduct/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const myBookings = await AllProducts.find(query).toArray();
      res.send(myBookings);
    });
    app.delete("/myproduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await AllProducts.deleteOne(query);
      res.send(result);
    });
    app.delete("/myBookingDelete/:id", async (req, res) => {
      const id = req.params.id;
      const bookinQuery = { bookingID: id };
      const bookingResult = await bookingCollection.deleteMany(bookinQuery);
      res.send(bookingResult);
    });
    app.put("/advertiseproduct/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          advertiseProdcut: true,
        },
      };
      const result = await AllProducts.updateOne(filter, updatedDoc, option);
      res.send(result);
    });
    app.get("/advertisePrudct", async (req, res) => {
      const query = { advertiseProdcut: true };
      const adProduct = await AllProducts.find(query).toArray();
      res.send(adProduct);
    });
  } finally {
  }
}
run();
app.get("/", async (req, res) => {
  res.send("Mobile Hut Server Runnin");
});
app.listen(port, () => console.log(`Mobile Hut Server Running on ${port}`));
