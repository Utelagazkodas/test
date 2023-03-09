const http = require("http")
const fs = require("fs")
const express = require("express")
const bodyParser = require("body-parser")
const WebSocket = require("ws")
const { json } = require("body-parser")

// PORT
const port = 80

const app = express()

const wss = new WebSocket.Server({ port: 443 });

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const accessableFiles =[
    "/index.html",
    "/images/juan.jpg",
    "/images/lain.jpg",
    "/images/vatican.jpg",
    "/page.html",
    "/secret.html",
    "/chat.html"
]

const redirects= {
    "/" : "/index.html",
    "/favcolor" : "/page.html",
    "/chat" : "/chat.html"
}

var messages = []

app.get("*", (req, res) =>{

    // if the file ends in html then sets the header to html
    if(req.path.includes(".html")){
        res.writeHead(200, {"Content-Type" : "text/html"})
    }

    if(redirects[req.path] != undefined){
        res.write("<Script>window.location.replace(window.location.origin +'" + redirects[req.path] +"')</Script>")
        res.end()
        return
    }
    else{

        if(accessableFiles.includes(req.path)){
            fs.readFile(req.path.substring(1), (err, data) => {
    
                if(err || data === "undefined"){
                    res.write("404 something went wrong 404")
                    res.end()
                    return
                }else{        
                    res.write(data)
                    res.end()
                    return
                }
            })
        }
        else{
            res.write("404 something went wrong 404")
            res.end()
            return
        }
    }
})

app.post("/favcolor", (req, res) =>{

    res.writeHead(200, {"Content-Type" : "text/html"})
  
    res.write("<html><body style='background-color: "+ req.body.favColor +"'>A legrosszabb szin az ez</body></html>")

    res.end()
})


wss.on("connection", function connection(ws){
    ws.send(JSON.stringify(messages))

    ws.on('message', function message(data) {

        messages.push(data.toString())

        wss.clients.forEach(function each(client){
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(messages))
            }
        })
            
    });
})


app.listen(port)
