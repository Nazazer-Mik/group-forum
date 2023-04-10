'use strict'

const express = require('express');
const path = require('path')
var bodyParser = require('body-parser')
let {MongoClient, ObjectId} = require('mongodb');
const { tmpdir } = require('os');

const app = express();

const port = process.env.PORT || 3000
const dbURL = "mongodb+srv://NodeServ:PzmwZGeE1AEnsxBh@users.ewqo7pg.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(dbURL);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

function PrintReqInfo(req)
{
  console.log(`New connection with ip ${req.ip}, url ${req.url} with ${req.method} method and body: ${JSON.stringify(req.body)}`)
}

//-----------DEBUG------------------------
var myLogger = function (req, res, next) {
  PrintReqInfo(req);
  next();
};
app.use(myLogger);
//----------------------------------------

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

app.get('/forum', (req, res) => {
  res.sendFile(`${__dirname}/public/pages/forum.html`);
});

//-----------------------------------Registering--------------------------------------------------------
app.post('/register', async (req, res) => {
  let user = req.body;
  let serverError = "";

  let available = await checkAvailability(user).catch((err) => {serverError = err;});
  
  if (serverError != "")
  {
    res.sendStatus(500); 
    console.log(serverError); 
    return;
  }
  
  if (available)
  {
    res.send(available);
    return;
  }
  
  user.creationTime = GetTime();
  await insertData(user);
  console.log(`The user with email ${user.email} and username ${user.username} was registered!`);
  res.send("ok");
});

async function checkAvailability(user) {
  const users = client.db("Users").collection("List");
  let status;
  const e = await users.findOne({username: user.username}).then((d) => {if(d) status = 2;}) || 
            await users.findOne({email: user.email}).then((d) => {if(d) status = 1;});
  
  switch (status)
  {
    case 1: 
      return("Error! This email is already registered! Try another one.\n");
      break;
    case 2:
      return("Error! This username is already occupied. Try another one.\n");
      break;
    default:
      return null;
  }
}

async function insertData(user) {
  const database = client.db("Users");
  const users = database.collection("List");
  await users.insertOne(user);
}

//-----------------------------------Logining---------------------------------------------------------

app.post('/login', async (req, res) => {
  let user = req.body;
  const users = client.db("Users").collection("List");
  let serverError = "";

  let doc = await users.findOne({email: user.email}).catch((err) => {serverError = err;});
    
  if (serverError != "")
  {
    res.sendStatus(500); 
    console.log(serverError); 
    return;
  }

  if (!doc)
  {
    res.send('1')
    return;
  } 
  else if (doc.password != user.password)
  {
    res.send('2');
    return;
  }

    console.log(`User ${doc.username} logged in!`)
    res.send(doc._id);
})

//-----------------------------------Check_for-redirect---------------------------------------------------------

app.post('/exist', async (req, res) => {
  let id = JSON.parse(req.body.id);
  const users = client.db('Users').collection('List');
  let doc = await users.findOne(ObjectId(id));
  if(!doc)
    res.send('no');
  else
    res.send('yes');
})

//------------------------------------Positng-messages-----------------------------------------------

app.post('/publish', async (req, res) => {
  let errors = "";
  let msg = req.body;
  const chat = client.db('Chat').collection(msg.room);
  const users = client.db('Users').collection('List');
  let doc = await users.findOne(ObjectId(JSON.parse(msg.id))).catch((err) => {errors += err});

  let insertion = {
    'username': doc.username,
    'id': msg.id,
    'time': msg.time,
    'room': msg.room,
    'message': msg.message
  }

  await chat.insertOne(insertion).catch((err) => {errors += err});

  if (errors == "")
    res.sendStatus(200)
  else
  {
    console.log(errors);
    res.sendStatus(500);
  }
})

//-------------------------------------Loading-Posts-------------------------------------------------

app.post('/get-posts', async (req, res) => {
  let dec = parseInt(req.body.dec);
  const chat = client.db('Chat').collection(req.body.room);
  let cursor = await chat.find().sort({_id: -1});
  let docs = [];

  for (let i = 10*(dec-1); i < 10*dec; i++)
  {
    if (await cursor.hasNext())
    {
      let d = await cursor.next();
      let ready = {
        username: d.username,
        time: d.time,
        message: d.message
      }
      docs.push(ready);
    }
    else
      break;
  }
  
  res.send(JSON.stringify(docs));
})

//-------------------------------------Loading-Posts-------------------------------------------------

app.post('/get-members', async (req, res) => {
  const chat = client.db('Users').collection('List');
  let cursor = await chat.find();
  let docs = [];

  while (await cursor.hasNext())
  {
    let d = await cursor.next();
    let ready = {
      username: d.username,
    }
    docs.push(ready);
  }
  
  res.send(JSON.stringify(docs));
})

//-------------------------------------Other---------------------------------------------------------


app.listen(port, async () => {
  console.log(`Listening on port ${port} at ${GetTime()}`);
  const database = await client.connect().catch(err => {
    console.log("Error while connecting to database!\n" + err);
  });
})

function GetTime()
{
  let tm = new Date();
  return tm.getDate() + '/' + (tm.getMonth()+1) + '/' +
  tm.getFullYear() + '@' + tm.getHours() + ':' +
  tm.getMinutes() + ':' + tm.getSeconds();
}