const express = require('express')
const app = express()
const cors = require("cors");
const dotenv = require('dotenv')
dotenv.config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
const uri = process.env.MONGODB_URI
const port = process.env.PORT

const allowedOrigins = [
    process.env.CLIENT_URL,
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})




// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)


// //dummy idea data 
// {
//   "_id": {
//     "$oid": "6a0f63842831527c23ae9077"
//   },
//   "ideaTitle": "DroneAid",
//   "shortDescription": "Emergency medical supply delivery via drones.",
//   "detailedDescription": "DroneAid leverages autonomous drones to deliver critical medical supplies to remote or disaster‑hit areas within minutes.",
//   "category": "Health",
//   "tags": [
//     "drones",
//     "logistics",
//     "emergency"
//   ],
//   "imageURL": "https://example.com/images/droneaid.jpg",
//   "estimatedBudget": 500000,
//   "targetAudience": "Hospitals, NGOs, disaster relief agencies",
//   "problemStatement": "Remote areas lack timely access to medical supplies during emergencies.",
//   "proposedSolution": "Deploy drones with smart routing to deliver medicines and equipment quickly."
// }


async function run() {
    try {

        // await client.connect();

        const db = client.db("ideavault")
        const ideaCollection = db.collection("idea")

        const commentCollection = db.collection("comments")

        const verifyToken = async (req, res, next) => {

            //pass everything for now
            next()
            return;

            const authHeader = req?.headers.authorization
            if (!authHeader) {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }

            const token = authHeader?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }


            try {
                const { payload } = await jwtVerify(token, JWKS)
                req.user = payload;
                console.log(payload);
                next()
            } catch (error) {
                return res.status(403).json({
                    message: "forbidden"
                });
            }

        }

        // app.get('/idea', async (req, res) => {

        //     const result = await ideaCollection.find().toArray()

        //     res.json(result)
        // })

        app.get('/idea', async (req, res) => {
            const limit = req.query.limit ? parseInt(req.query.limit) : 0;
            const search = req.query.search || "";
            const category = req.query.category || "";

            const query = {};

            if (search) {
                query.ideaTitle = { $regex: search, $options: "i" };
            }

            if (category) {
                query.category = category;
            }

            const result = await ideaCollection.find(query).limit(limit).toArray();
            res.json(result);
        });

        app.get('/idea/:id', verifyToken, async (req, res) => {
            const id = req.params.id;

            const result = await ideaCollection.findOne({ _id: new ObjectId(id) })


            res.json(result)
        })

        app.get('/ideasbycreator/:creatorId', verifyToken, async (req, res) => {
            const { creatorId } = req.params;
            const result = await ideaCollection
                .find({ creatorId: creatorId })
                .toArray();
            res.json(result);
        });

        //idea title only for comment display

        app.get('/ideaname/:id', async (req, res) => {
            const id = req.params.id;
            const result = await ideaCollection.findOne(
                { _id: new ObjectId(id) },
                { projection: { ideaTitle: 1, _id: 0 } }  // only return title
            );
            res.json({ title: result?.ideaTitle ?? "Unknown Idea" });
        });

        app.delete('/idea/:id', verifyToken, async (req, res) => {
            const id = req.params.id;

            const result = await ideaCollection.deleteOne({ _id: new ObjectId(id) })


            res.json(result)
        })

        app.patch('/idea/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;
            console.log(updatedData);
            const result = await ideaCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            )
            res.json(result)
        })



        app.post('/idea', async (req, res) => {
            const idea = req.body
            console.log("idea ", idea)
            const result = ideaCollection.insertOne(idea)

            res.json(result)
        })

        //comment stuff

        app.post('/comment', verifyToken, async (req, res) => {
            const commentData = req.body

            const result = await commentCollection.insertOne(commentData)

            res.json(result)
        })

        app.get('/comment/:ideaId', verifyToken, async (req, res) => {
            const { ideaId } = req.params;
            const result = await commentCollection.find({
                ideaId: ideaId,
            }).toArray();
            console.log(result);
            res.json(result);
        })

        app.get('/commentbyuser/:userId', verifyToken, async (req, res) => {
            const { userId } = req.params;
            const result = await commentCollection
                .find({ userId: userId })
                .sort({ time: -1 })  // descending
                .toArray();
            res.json(result);
        });

        app.get('/idea/:id', async (req, res) => {
            const result = await ideaCollection.findOne({ _id: new ObjectId(req.params.id) });
            res.json(result);
        });

        app.patch('/comment/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const { comment } = req.body;
            const result = await commentCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { comment } }
            );
            res.json(result);
        });

        app.delete('/comment/:commentid', verifyToken, async (req, res) => {
            const commentid = req.params.commentid;

            const result = await commentCollection.deleteOne({ _id: new ObjectId(commentid) })


            res.json(result)
        })



        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);
