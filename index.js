const express = require('express');
const app = express()
const PORT = 5000
const cors = require('cors')
const jose = require("jose");
const dotsenv = require('dotenv')
dotsenv.config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

app.use(cors());


app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const jwks = jose.createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

const Valudateapi = async (req, res, next) => {
  const authheader = req.headers.authorization;

  if (!authheader) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  const token = authheader.split(' ')[1];

  try {
    const { payload } = await jose.jwtVerify(token, jwks);
    req.user = payload;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error);
    return res.status(403).json({ message: error.message });
  }
};




async function run() {
  try {
 
    await client.connect();
    const db = client.db('traveldatabase')  
    const DestinationData = db.collection('Destinationinfo')
    const BookingData = db.collection('Bookinginfo')

    app.delete('/destination/:id' , Valudateapi , async (req , res ) => {
      const {id} = req.params

      const result = await DestinationData.deleteOne({_id  : new ObjectId(id)})
      console.log(result)
      res.send(result)
    })

    app.delete('/booking/:id' , Valudateapi , async(req , res ) => {
      const {id} = req.params
      const result = await BookingData.deleteOne({_id : new ObjectId(id)})
      console.log(result)
      res.send(result)
    })

    app.patch('/destination/:id' , Valudateapi , async (req , res ) => {
      const {id} = req.params
      const NewData = req.body
      console.log(NewData)
      const result = await DestinationData.updateOne(
        {_id : new ObjectId(id)},
        {$set : NewData}
      ) 
      console.log(result)
      res.send(result)
    })

    app.post( '/destination' , async (req , res ) => {
        console.log('route hit')
      const Data =  req.body
      console.log(Data)
      const result = await  DestinationData.insertOne(Data);
      res.send(result)
    })

    app.post('/booking' , Valudateapi,  async (req , res ) => {
     try {
    const data = req.body;

    console.log(data);

    const result = await BookingData.insertOne(data);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
    })
    
    app.get( '/booking/:Id' ,Valudateapi, async (req , res) => {
      const {Id} = req.params
      const result = await BookingData.find({Id : Id }).toArray()
      res.send(result)
      
    })

 app.get('/destination' , async(req , res) => {
    const result = await DestinationData.find().toArray()
    res.send(result)
 }) 
 app.get('/destination/:id' , Valudateapi , async(req , res ) => {
    const {id} = req.params

    const result = await DestinationData.findOne({_id : new ObjectId(id)})
    res.send(result);
 })






    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    
   
  }
}
run().catch(console.dir);


app.get('/', async (req , res )  => {
  res.send('Hi server')
})
app.listen(PORT , () => {
    console.log(`SERVER IS RUNNING PERFECTLY IN ${PORT} PORT `)
})