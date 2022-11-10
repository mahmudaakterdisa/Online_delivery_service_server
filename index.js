const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {

    try {

        const serviceCollection = client.db('sweet').collection('services');
        const reviewCollection = client.db('sweet').collection('review');

        //jwt
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.send({ token })
        })

        //service data
        app.get('/services', async (req, res) => {
            const query = {}

            const { limit } = req.query;


            const cursor = serviceCollection.find(query).limit(parseInt(limit) || 3).sort({ "service_date": -1 });
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

        //create service order
        app.post('/services', async (req, res) => {

            const order = req.body;
            const result = await serviceCollection.insertOne(order);
            res.send(result);
        });

        //get review on  details service
        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service: id };


            const cursor = reviewCollection.find(query).sort({ "review_date": -1 });
            const myreviews = await cursor.toArray();
            res.send(myreviews);
        });

        //get review
        app.get('/review', verifyJWT, async (req, res) => {

            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //get individuel review

        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const myreview = await reviewCollection.findOne(query);
            res.send(myreview);
        });

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
        });

        //update

        app.put('/review/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            const option = { upsert: true };
            const updatedUser = {
                $set: {
                    message: user.message
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedUser, option);
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