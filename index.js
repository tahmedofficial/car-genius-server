const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({ origin: ["http://localhost:5173",], credentials: true, }));
app.use(express.json());
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ufkobjs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const database = client.db("carDoctorDB");
        const serviceCollection = database.collection("services");
        const bookingCollection = database.collection("bookings");

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        };

        // Code hear-------------------------------

        // Auth related api
        app.post("/jwt", async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: "1h" });
            res.cookie("token", token, cookieOptions).send({ success: true });
        })

        // services related api
        app.get("/services", async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 }
            }
            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })

        // Bookings
        app.get("/bookings", async (req, res) => {
            console.log(req.query);
            console.log("token ",req.cookies.token);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email };
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.post("/bookings", async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.patch("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                }
            }
            const result = await bookingCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        // Code hear-------------------------------

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Server is running");
})

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})