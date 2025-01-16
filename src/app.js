const express = require('express');

const app = express();


app.get("/user/:uid/:name",(req,res)=>{
    console.log(req.params);
     res.send({firstname:"yash",lastname:"s"});
})






app.listen(7777,()=>{
    console.log("Server is running.....")
});