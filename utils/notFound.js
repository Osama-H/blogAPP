const notFound = ('*',(req,res,next)=>{
    res.status(404).json({
      status : 'fail',
      mesasge : `Cant find ${req.originalUrl} in this Server!`
    })
  })

  module.exports = notFound;