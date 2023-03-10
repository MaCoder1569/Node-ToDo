const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const app = express();
require('dotenv').config()
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));

//미들웨어세팅
//요청-응답 중간에 실행되는 코드
//전역 설정, 따로 실행하고 싶으면 따로 넣어주면 됨
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public',express.static('public'));
app.use(methodOverride('_method'));
app.use(session({secret:'비밀코드',resave:true,saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/shop',require('./routes/shop'))
app.use('/upload',require('./routes/image'))

app.set('view engine', 'ejs');

function isLogin(request,response,next){
  //로기인 후 세션이 있으면 request.user가 항상 있음
  if(request.user){
    //다음 프로세스로 통과
    next()
  }else{
    response.send('Not Login')
  }
}

let db;
MongoClient.connect(process.env.DB_URL,(error,client)=>{
  if(error) return console.log(error);
  
  db = client.db('todoapp');

  app.listen(process.env.PORT, () => {
    console.log('Start Express Port:8080');
  });
})

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password',
  session: true,
  passReqToCallback: false,
}, function (id, password, done) {
  db.collection('login').findOne({ id: id }, function (error, result) {
    if (error) return done(error)

    if (!result) return done(null, false, { message: '존재하지않는 아이디요' })

    if (password == result.pw) {
      return done(null, result)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

//id를 이용해서 세션을 저장시키는 코드(로그인 성공시)
//자동으로 쿠키 전송
passport.serializeUser(function(user,done){
  done(null,user.id)
})

//세션 데이터를 가진 사람을 DB에서 찾기(마이페이지 접속시)
passport.deserializeUser(function(id,done){
  db.collection('login').findOne({ id: id }, function (error, result) {
    //request.user 에 저장됨
    done(null,result)
  })
})

app.get('/', (request, response) => {
  response.render('index.ejs');
});

app.get('/write', (request, response) => {
  response.render('write.ejs');
});

// app.get('/write', (request, response) => {
//   response.sendFile(__dirname + '/write.html');
// });

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

app.get('/edit/:id',(request, response)=>{
  db.collection('post').findOne({_id:parseInt(request.params.id)},(error,result)=>{
    response.render('edit.ejs',{post:result})
  });
})

app.post('/add', (request, response) => {
  db.collection('counter').findOne({name:'게시물갯수'},(error,result)=>{
    if(error) return console.log(error);
    let totalPost = result.totalPost
    db.collection('post').insertOne({_id:totalPost+1,...request.body,author:request.user.id},(error,result)=>{
      if(error) return console.log(error);
      db.collection('counter').updateOne({name:'게시물갯수'},{$inc:{totalPost:1}},(error,result)=>{
        if(error) return console.log(error);
        response.redirect('/list')
      });
    });
  });
});

app.put('/update', (request, response) => {
  db.collection('post').updateOne({_id:parseInt(request.body.id)},{$set:{title:request.body.title,date:request.body.date}},(error,result)=>{
    if(error) return console.log(error);
    response.redirect('/list')
  });
});

app.delete('/delete',(request, response) => {
  db.collection('post').deleteOne({_id:parseInt(request.body.id),author:request.user.id},(error,result)=>{
    if(error) return console.log(error);
    response.status(200).send({message:'success'});
  });
})

app.get('/search',(request, response)=>{
  //검색할 문서 양 제한두기
  let search=[
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: request.query.value,
          path: 'title'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        }
      }
    }
  ]
  db.collection('post').aggregate(search).toArray((error,result)=>{
    response.render('list.ejs',{posts:result});
  });
})

app.get('/login',(request, response)=>{
  response.render('login.ejs')
})

app.post('/login',passport.authenticate('local',{failureRedirect:'/fail'}),(request, response)=>{
  response.redirect('/')
})

app.get('/mypage',isLogin,(request, response)=>{
  response.render('mypage.ejs',request.user)
  })

app.post('/register',(request,response)=>{
  db.collection('login').insertOne({id:request.body.id,pw:request.body.password},(error,result)=>{
    if(error) return console.log(error);
      response.redirect('/');
  });
})


//express-rate-limit