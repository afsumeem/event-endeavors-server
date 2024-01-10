require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

//
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7s5ai.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("eventEndeavors");
    const eventsCollection = db.collection("events");
    const teamsCollection = db.collection("teams");
    const guestCollection = db.collection("guests");
    const reviewsCollection = db.collection("reviews");
    const userCollection = db.collection("users");

    //
    // Middleware to generate a random 4-digit serial number
    app.use((req, res, next) => {
      const randomSerial = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
      req.generatedSerial = randomSerial.toString().padStart(4, "0");
      next();
    });

    //get all event

    app.get("/events", async (req, res) => {
      const cursor = eventsCollection.find({});
      const event = await cursor.toArray();
      res.send(event);
      // console.log(event);
    });

    //get filtered event

    app.get("/filteredEvents", async (req, res) => {
      const { search, category } = req.query;

      const filter = {};
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }
      if (category) {
        filter.category = category;
      }

      const event = await eventsCollection.find(filter).toArray();
      res.send(event);
      // console.log(event);
    });

    //get teams

    app.get("/teams", async (req, res) => {
      const cursor = teamsCollection.find({});
      const team = await cursor.toArray();
      res.send(team);
      // console.log(team);
    });

    //get single event

    app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      const result = await eventsCollection.findOne({ _id: ObjectId(id) });
      // console.log(result);
      res.send(result);
    });

    // add new event

    app.post("/events", async (req, res) => {
      const event = await eventsCollection.insertOne(req.body);
      // console.log(user);
      res.json(event);
    });

    //guest registration
    app.post("/guests", async (req, res) => {
      const guest = await guestCollection.insertOne(req.body);
      // console.log(guest);
      res.json(guest);
    });

    app.get("/guests", async (req, res) => {
      const cursor = guestCollection.find({});
      const guests = await cursor.toArray();
      res.send(guests);
      // console.log(guests);
    });

    //reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // post reviews
    app.post("/reviews", async (req, res) => {
      const reviews = await reviewsCollection.insertOne(req.body);
      res.json(reviews);
    });

    //

    //users
    app.get("/users", async (req, res) => {
      const user = await userCollection.find({}).toArray();
      // console.log(user);
      res.json(user);
    });

    //
    app.post("/users", async (req, res) => {
      const user = await userCollection.insertOne(req.body);
      // console.log(user);
      res.json(user);
    });

    //update user
    app.put("/users/:id", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateUser = { $set: user };
      const result = await userCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.json(result);
    });

    // app.patch("/users/:id", async (req, res) => {
    //   try {
    //     const userId = req.params.id;
    //     const updatedUser = req.body;

    //     // Assuming userCollection is a MongoDB collection
    //     const result = await userCollection.updateOne(
    //       { _id: userId }, // Assuming user ID is stored as "_id" in MongoDB
    //       { $set: updatedUser },
    //       { upsert: true }
    //     );

    //     res.json(result);
    //   } catch (error) {
    //     console.error("Error occurred during user update:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    //
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  // console.log(`Example app listening on port ${port}`);
});
