const express = require('express');
const app= express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    // "https://hero-task-a200a.web.app",
    // "https://hero-task-a200a.firebaseapp.com",
  ]
}));
app.use(express.json());

// DzrN6BSjKntsYNHx
// taskHero

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yk1xelo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const userCollection = client.db('taskHero').collection('users');
    const productsCollection = client.db('taskHero').collection('products');

    // product related api
    app.get('/products',async(req,res)=>{
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const searchQuery = req.query.search ||'';
      const sort = req.query.sort || '';
      const brand = req.query.brand || '';
      const category = req.query.category || '';
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || 10000;


      const query = {
        productName: { $regex: searchQuery, $options: 'i' },
        ...(brand && { brand }),
        ...(category && { category }),
        price: { $gte: minPrice, $lte: maxPrice }
    };
       // Determine the sorting order based on the `sort` parameter
        let sortOption = {};
        if (sort === 'price-asc') {
          sortOption = { price: 1 };
        } else if (sort === 'price-desc') {
          sortOption = { price: -1 };
        } else if (sort === 'date-desc') {
          sortOption = { createdAt: -1 };
        } else {
          sortOption = { createdAt: 1 }; // Default sorting
        }
      
      const result = await productsCollection.find(query)
      .sort(sortOption)
      .skip(page*size)
      .limit(size)
      .toArray();
      res.send(result);
    })

    app.get('/productCount',async(req,res)=>{
      const count = await productsCollection.estimatedDocumentCount();
      console.log(count)
      res.send({count})
    })
    // user related api
    app.post('/users', async(req, res)=>{
        const user = req.body;
        // console.log(user)
        const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
        if(existingUser){
            return res.send({message:'user already exists', insertedId:null})
        }
        const result = await userCollection.insertOne(user);
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', async(req,res)=>{
    res.send('product server is running')
})
app.listen(port, ()=>{
    console.log(`product running on port ${port}`)
})