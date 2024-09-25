const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({ origin: ["http://localhost:5173",], credentials: true, }));
app.use(express.json());


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

        // Code hear-------------------------------

        app.get("/services", async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: { title: 1, price: 1, service_id: 1 }
            }
            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })

        // Bookings
        app.post("/bookings", async (req, res) => {
            const booking = req.body;

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