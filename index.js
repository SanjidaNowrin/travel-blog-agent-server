const express = require("express");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const cors = require("cors");
//dotenv
require("dotenv").config();

const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uj11r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("travelBlog");
    const blogsCollection = database.collection("blogs");
    const usersCollection = database.collection("users");

    //get api
    app.get("/blogs", async (req, res) => {
      const cursor = blogsCollection.find({});
      const blogs = await cursor.toArray();
      res.send(blogs);
    });
    // load single blog get api
    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const products = await blogsCollection.findOne(query);
      res.json(products);
    });

    //manage all blogs
    // get all orders
    app.get("/allBlogs", async (req, res) => {
      const cursor = blogsCollection.find({});
      const blogs = await cursor.toArray();
      res.send(blogs);
    });
    // delete orders

    app.delete("/deleteBlogs/:id", async (req, res) => {
      console.log(req.params.id);
      const result = await blogsCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });
    // add blog from form using dashboard admin
    app.post("/addBlog", async (req, res) => {
      console.log(req.body);
      const result = await blogsCollection.insertOne(req.body);
      console.log(result);
    });

    //  make admin
    app.post("/addUserInfo", async (req, res) => {
      console.log("req.body");
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
      console.log(result);
    });
    app.put("/makeAdmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await usersCollection.find(filter).toArray();
      if (result) {
        const documents = await usersCollection.updateOne(filter, {
          $set: { role: "admin" },
        });
        console.log(documents);
      }
    });

    // check admin or not
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await usersCollection
        .find({ email: req.params.email })
        .toArray();
      console.log(result);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Travel Agency!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
