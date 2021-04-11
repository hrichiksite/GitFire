const fetch = require('node-fetch');
const express = require('express');
const app = express();
const redis = require("redis");
const client = redis.createClient({
    url:process.env.REDIS_URL
});

client.auth(process.env.REDISPASSWORD);

client.on('error', err => {
  console.log('Error ' + err);
});

const port = process.env.PORT || 3000;



//code from https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
function getExtension(path) {
    var basename = path.split(/[\\/]/).pop(),  // extract file name from full path ...
                                               // (supports `\\` and `/` separators)
        pos = basename.lastIndexOf(".");       // get last position of `.`

    if (basename === "" || pos < 1)            // if file name is empty or ...
        return "";                             //  `.` not found (-1) or comes first (0)

    return basename.slice(pos + 1);            // extract extension ignoring `.`
}

app.get('/', async (req, res) => {
    res.send("The GitFire CDN, check out gitfire.xyz for more details");
})

app.get('/gh/:git/:repo/:branch/*', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", '*');

  var user = req.params.git;
  var repo  = req.params.repo;
  var fullurl = req.url;
  var pathlist = fullurl.split("/");
  var path = pathlist.slice(5);
  path = path.join();
  path = path.replace(",","/")
  console.log(path)
  var branch = req.params.branch;
  var filetype = getExtension(path);

  var url = "https://raw.githubusercontent.com/" + user + "/"+ repo +"/"+ branch +"/"+ path;
  console.log(url)
    
client.get("blacklist", async (err, reply) => {
    var blacklist = JSON.parse(reply);
if(blacklist.includes(user) === false){
 if(filetype==="js"){
        var request = await fetch(url);
        var response = await request.text();
        res.setHeader('Cache-Control', 's-maxage=3155695200000')
        res.setHeader("content-type", 'text/javascript');
        res.send(response);
} else if(filetype==="json"){
        var request = await fetch(url);
        var response = await request.text();
        res.setHeader('Cache-Control', 's-maxage=3155695200000')
        res.setHeader("content-type", 'application/json');
        res.send(response);
} else if(filetype==="css"){
        var request = await fetch(url);
        var response = await request.text();
        res.setHeader('Cache-Control', 's-maxage=3155695200000')
        res.setHeader("content-type", 'text/css');
        res.send(response);
} else if(filetype==="png"){
        res.setHeader('Cache-Control', 's-maxage=3155695200000')
        res.send("Fetch This File Directly From GitHub or host it in Cloudflare pages, can't waste bandwidth");
} else {
    res.send("Sorry, File not supported");
}
} else {
    res.send("User Blocked for abusing , please appeal to abuse@gitfire.xyz if you belive this is not right");
}
})
})

app.listen(port, () =>{
    console.log("App started")
})