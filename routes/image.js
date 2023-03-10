let router = require('express').Router();
let path = require('path');
let multer = require('multer');
let storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'./public/images')
  },
  filename:function(req,file,cb){
    cb(null,file.originalname)
  },
})

let upload = multer({storage:storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        return callback(new Error('PNG, JPG만 업로드하세요'))
    }
    callback(null, true)
  },
  limits:{
      fileSize: 1024 * 1024
  }})

router.get('/',(request,response)=>{
  response.render('upload.ejs')
})

//여러개 할려면 upload.array
router.post('/',upload.single('profile'),(request,response)=>{
  response.send('업로드 완료')
})

router.get('/image/:id',(request,response)=>{
  response.sendFile(__dirname+'/public/images'+request.params.id)
})


module.exports = router;