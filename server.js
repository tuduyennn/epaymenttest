if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const stripeSerectKey = process.env.STRIPE_SECRECT_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
console.log(stripeSerectKey);
const express = require('express')
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripeSerectKey)


app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.static('public'));

app.get('/store', function (req, res) {
  fs.readFile('items.json', function (error, data) {
    if (error) {
      res.status(500).end()
    } else {
      res.render('store.ejs', {
        stripePublicKey: stripePublicKey,
        items: JSON.parse(data)
      })
    }
  })
});
app.post('/purchase', function (req, res) {
  fs.readFile('items.json', function (error, data) {
    if (error) {
      res.status(500).end()
    } else {
     const itemsJson = JSON.parse(data)
     const itemsArray = itemsJson.music.concat(itemsJson.merch)
     let total=0
     req.body.items.forEach(function(item){
       const itemsJson = itemsArray.find(function(i){
         return i.id == item.id
       })
       total = total + itemsJson.price * item.quantity
     })
     stripe.charges.create({
       amount:total,
       source: req.body.stripeTokenId,
       currency:'usd'
     }).then(function(){
      console.log('Charge Suscessful')
      res.json({message:'Susscessfully purchased items'})
     }).catch(function(){
       console.log('Charge Fail')
       res.status(500).end()
     })
    }
  })
});
  

app.listen(3000);
