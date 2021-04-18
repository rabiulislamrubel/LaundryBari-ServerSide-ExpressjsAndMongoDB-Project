const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config();
const fileUpload = require('express-fileupload');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mldqx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('service'));
app.use(fileUpload());
const port = 5000;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (req, res) => {
  res.send('Hello,I am here');
});

client.connect((err) => {
  const serviceCollection = client
    .db('laundryBari')
    .collection('laundryService');
  const adminCollection = client.db('laundryBari').collection('adminEmail');
  const reviewsCollection = client.db('laundryBari').collection('reviews');
  const ordersCollection = client.db('laundryBari').collection('orders');

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const serviceName = req.body.serviceName;
    const price = req.body.price;
    const description = req.body.description;
    const newImg = file.data;

    const encImg = newImg.toString('base64');
    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64'),
    };

    serviceCollection
      .insertOne({ serviceName, price, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post('/makeAdmin', (req, res) => {
    const email = req.body;
    adminCollection.insertOne(email).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post('/reviews', (req, res) => {
    const reviewsData = req.body;
    console.log(reviewsData);
    reviewsCollection.insertOne(reviewsData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get('/reviewsData', (req, res) => {
    reviewsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get('/book/:pdId', (req, res) => {
    const param = req.params;
    serviceCollection
      .find({ _id: ObjectId(param.pdId) })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get('/service', (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get('/manage', (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post('/serviceOrders', (req, res) => {
    const ordersData = req.body;
    ordersCollection
      .insertOne(ordersData)
      .then((result) => res.send(result.insertedCount > 0));
  });

  app.get('/bookingList', (req, res) => {
    const emailOne = req.query.email;
    ordersCollection.find({ email: emailOne }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get('/allOrder', (req, res) => {
    ordersCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents.length > 0);
    });
  });

  app.delete('/delete/:id', (req, res) => {
    serviceCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((err, result) => {
        console.log(result.deletedCount > 0);
      });
  });
});

app.listen(port, console.log('Hello, Its working'));
