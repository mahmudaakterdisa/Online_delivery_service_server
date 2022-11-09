const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// const corsOption = { origin: "*", method: ["GET", "POST", "DELETE", "PUT", "PATCH"] }
//middle wares

app.use(cors());
app.use(express.json());



//mongo user setup


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hgitfpl.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {

    try {

        const serviceCollection = client.db('sweet').collection('services');
        const reviewCollection = client.db('sweet').collection('review');


        app.get('/services', async (req, res) => {
            const query = {}
            // const { limit } = req.query;
            // if (limit) {
            //     query = { limit }
            //     const cursor = serviceCollection.find({}).sort({ date: -1 }).limit(3);
            // }

            // else {
            //     query = {}
            //     const cursor = serviceCollection.find(query);

            // }

            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        //get individual data using id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });



        //get review
        app.get('/review', async (req, res) => {

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        //post review
        app.post('/review', async (req, res) => {

            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        //delete

        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('online cake house is running')
})

app.listen(port, () => {
    console.log(`online cake house server on ${port}`);
})