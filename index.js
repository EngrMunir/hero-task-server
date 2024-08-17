const express = require('express');
const app= express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', async(req,res)=>{
    res.send('product server is running')
})
app.listen(port, ()=>{
    console.log(`product running on port ${port}`)
})