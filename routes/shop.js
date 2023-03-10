let router = require('express').Router();

function isLogin(request,response,next){
  //로기인 후 세션이 있으면 request.user가 항상 있음
  if(request.user){
    //다음 프로세스로 통과
    next()
  }else{
    response.send('Not Login')
  }
}

router.use(isLogin)
//특정 url만 적용하고 싶을 때
// router.use('/shirts',isLogin)

router.get('/shirts',(request,response)=>{
  response.send('셔츠 파는 페이지입니다.')
})

router.get('/pants',(request,response)=>{
  response.send('바지 파는 페이지입니다.')
})

module.exports = router;