const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ku98crh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection


    const galleryCollection = client.db('artDB').collection('gallery');

    app.get('/gallery', async (req, res) => {
      const cursor = galleryCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

     //--search functionality--
    app.get('/search', async (req, res) => {
      const query = req.query.q;
      const searchResult = await galleryCollection.find({
        eventType: { $regex: query, $options: 'i' }
      }).toArray();
      res.json(searchResult)
    })


    const bookingCollection = client.db('artDB').collection('booking');

    app.post('/booking', async(req,res)=>{
      const newBooking = req.body;
      const result = await bookingCollection.insertOne(newBooking);
      res.send(result);
    })

    //email based booking
    app.get('/booking', async(req,res)=>{
      const email = req.query.email;
      const booking = await bookingCollection.find({email}).toArray();
      res.send(booking)
    })

    app.delete('/booking/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

    //update
    app.get('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.findOne(query);
      res.send(result);
    })

    app.put('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedPage = req.body;

      const booking = {
        $set: {
          phone: updatedPage.phone,
          date: updatedPage.date,
          time: updatedPage.time,
          service: updatedPage.service,
          photographyPackage: updatedPage.photographyPackage,
          cinematographyPackage: updatedPage.cinematographyPackage,
          comboPackage: updatedPage.comboPackage,
          standardType: updatedPage.standardType,
          premiumType: updatedPage.premiumType,
          signatureType: updatedPage.signatureType
        }
      }
      const result = await bookingCollection.updateOne(filter, booking, options);
      res.send(result)
    })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Art Server is running')
})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})