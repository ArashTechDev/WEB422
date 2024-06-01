/********************************************************************************
* WEB422 – Assignment 1
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Arashdeep Singh Student ID: 165871229 Date: 17 May 2024
*
* Published URL: ___________________________________________________________
********************************************************************************/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const ListingsDB = require("./modules/listingsDB.js");

const db = new ListingsDB();
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));
db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => app.listen(port, () => console.log(`Server listening on: ${port}`)))
  .catch(err => console.log(err));


  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  


app.post('/api/listings', async (req, res) => {
  try {
    const newListing = await db.addNewListing(req.body);
    res.status(201).json(newListing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/listings', async (req, res) => {
  const { page, perPage, name } = req.query;

  // Parse page and perPage to integers
  const pageInt = parseInt(page);
  const perPageInt = parseInt(perPage);

  
  if (isNaN(pageInt) || isNaN(perPageInt) || pageInt <= 0 || perPageInt <= 0) {
    return res.status(400).json({ error: 'Invalid page or perPage values' });
  }

  try {
   
    const listings = await db.getAllListings(pageInt, perPageInt, name);
    return res.status(200).json(listings);
  } catch (err) {
  
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await db.getListingById(req.params.id);
    if (listing)
    {
      res.status(200).json(listing);
    }
    else
    {
      res.status(404).json({ error: "Listing not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




app.delete('/api/listings/:id', async (req, res) => {
  try {
    const result = await db.deleteListingById(req.params.id);
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Listing deleted" });
    } else {
      res.status(404).json({ error: "Listing not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






app.put('/api/listings/:id', async (req, res) => {
  try {
    const result = await db.updateListingById(req.body, req.params.id);
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Listing updated" });
    } else if (result.matchedCount === 1) {
      res.status(409).json({ error: "No changes were made." });
    } else {
      res.status(404).json({ error: "Listing not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


