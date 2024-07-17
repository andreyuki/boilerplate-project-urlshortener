require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
var bodyParser = require("body-parser");
const dns = require("node:dns")
const urlparser = require('url')
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const mongo_uri = process.env.MONGO_URI
mongoose.connect(mongo_uri, { useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
  url: String,
  shortUrl: Number
})
let Url = mongoose.model('Url', urlSchema);

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req,res) => {
  const originalUrl = req.body.url;

  const dnslookup = dns.lookup(urlparser.parse(originalUrl).hostname, 
    async (err, address, family) => {
      if (!address) {
        res.json({error: "Invalid url"})
      } else {
        const urlsCount = await Url.countDocuments({});
        const newUrl = new Url({
          url: originalUrl,
          shortUrl: urlsCount
        });
        const result = await newUrl.save()
        res.json({
          original_url:originalUrl,
          short_url:urlsCount
        });
      }
    })

});

app.get("/api/shorturl/:shortUrl", async (req, res) => {
  const shortUrl = req.params.shortUrl

  const url = await Url.findOne({shortUrl:+shortUrl})
  return res.redirect(url.url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
