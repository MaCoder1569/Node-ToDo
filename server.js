const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public',express.static('public')) 

app.set('view engine', 'ejs');

let db;
MongoClient.connect('mongodb+srv://wnsgur1569:qwaszx45@cluster0.foft3t5.mongodb.net/?retryWrites=true&w=majority',(error,client)=>{
  if(error) return console.log(error);
  
  db = client.db('todoapp');

  app.listen(8080, () => {
    console.log('Start Express Port:8080');
  });
})

app.get('/', (request, response) => {
  response.render('index.ejs');
});

app.get('/write', (request, response) => {
  response.render('write.ejs');
});

app.get('/list',(request, response)=>{
  db.collection('post').find().toArray((error,result)=>{
    response.render('list.ejs',{posts:result})
  });
})

app.get('/detail/:id',(request, response)=>{
  db.collection('post').findOne({_id:parseInt(request.params.id)},(error,result)=>{
    response.render('detail.ejs',{post:result})
  });
})

app.post('/add', (request, response) => {
  db.collection('counter').findOne({name:'게시물갯수'},(error,result)=>{
    if(error) return console.log(error);
    let totalPost = result.totalPost
    db.collection('post').insertOne({_id:totalPost+1,...request.body},(error,result)=>{
      if(error) return console.log(error);
      db.collection('counter').updateOne({name:'게시물갯수'},{$inc:{totalPost:1}},(error,result)=>{
        if(error) return console.log(error);
        db.collection('post').find().toArray((error,result)=>{
          response.render('list.ejs',{posts:result})
        });
      });
    });
  });
});

app.delete('/delete',(request, response) => {
  console.log('request.body.number: ', request.body.id);
  db.collection('post').deleteOne({_id:parseInt(request.body.id)},(error,result)=>{
    if(error) return console.log(error);
    response.status(200).send({message:'success'});
  });
})