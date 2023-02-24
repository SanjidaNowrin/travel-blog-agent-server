const express = require("express");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const cors = require("cors");
//dotenv
require("dotenv").config();

const { MongoClient } = require("mongodb");
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

console.log(uri);

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
    const commentCollection = database.collection("comment");

    //get api and pagination
    app.get("/blogs", async (req, res) => {
      const query = { status: "Approved" };
      const cursor = blogsCollection.find(query);
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let blogs;
      const count = await cursor.count();
      if (page) {
        blogs = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        blogs = await cursor.toArray();
      }

      res.send({
        blogs,
        count,
      });
    });

    // load single blog get api
    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const products = await blogsCollection.findOne(query);
      res.json(products);
    });
    // user my blogs
    //get blogs
    app.get("/myblog", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const carts = await blogsCollection.find(query).toArray();

      res.json(carts);
    });
    // delete data from user my blogs
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await blogsCollection.deleteOne(query);
      res.json(result);
    });
    //manage all blogs
    // get all blogs
    app.get("/allBlogs", async (req, res) => {
      const cursor = blogsCollection.find({});
      const blogs = await cursor.toArray();
      res.send(blogs);
    });
    // delete blog

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
    // add blog from form using dashboard user(trial)
    app.post("/writeBlog", async (req, res) => {
      console.log(req.body);
      const result = await blogsCollection.insertOne(req.body);
      console.log(result);
    });
    // const status = req.query.status;
    // if (status == "Approve") {
    //   const result = await blogsCollection.insertOne(req.body);
    // }
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
    //update
    app.put("/userBlog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const event = {
        $set: {
          status: "Approved",
        },
      };
      const result = await blogsCollection.updateOne(query, event);
      res.json(result);
    });

    //user comment
    app.post("/comment", async (req, res) => {
      console.log("req.body");
      const result = await commentCollection.insertOne(req.body);
      res.send(result);
      console.log(result);
    });
    app.get("/comment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { blogId: id };
      const products = await commentCollection.find(query).toArray();
      res.json(products);
    });
    // delete comment api
    app.delete("/comment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await commentCollection.deleteOne(query);
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
module.exports = app;
