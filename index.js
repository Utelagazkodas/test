// MODULES
const http = require("http")
const fs = require("fs")
const express = require("express")
const bodyParser = require("body-parser")
const WebSocket = require("ws")
const { json } = require("body-parser")
const { Console } = require("console")

// PORT
const port = 80

// non module variables
const app = express()
const wss = new WebSocket.Server({ port: 443 });

// sets up json on express server
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// the files the clients can access
const accessableFiles =[
    "/index.html",
    "/images/juan.jpg",
    "/images/lain.jpg",
    "/images/vatican.jpg",
    "/page.html",
    "/secret.html",
    "/chat.html",
    "/favicon.ico"
]

// the urls that redirect and what they redirect to
const redirects= {
    "/" : "/index.html",
    "/favcolor" : "/page.html",
    "/chat" : "/chat.html"
}

var messages = []

// called when an error accoures prints out a comment and general info to the console
function error(req, res, comment){
    console.log("\n" + comment)
    console.log("error accoured when " + req.ip + " tried accesing " + req.path)
    res.write("error 404")
}

// runs when the server gets a get request to any URL
app.get("*", (req, res) =>{

    console.log("\n" + "GET request made to: "+ req.path)
    console.log("from ip: " + req.ip + "\n")

    // if the file ends in html then sets the header to html
    if(req.path.includes(".html")){
        res.writeHead(200, {"Content-Type" : "text/html"})
    }

    // if the url is a redirect, redirects the client
    if(redirects[req.path] != undefined){
        res.write("<Script>window.location.replace(window.location.origin +'" + redirects[req.path] +"')</Script>")
        res.end()
        return
    }

    else{

        //checks if the file the client is trying to acces accessable
        if(accessableFiles.includes(req.path)){

            // reads the file the client is trying to access
            fs.readFile(req.path.substring(1), (err, data) => {
    
                if(err || data === "undefined"){
                    error(req, res, "An error accured while trying to read file")
                    res.end()
                    return
                }else{        
                    res.write(data)
                    res.end()
                    return
                }
            })
        }
        // sends error if the file is unacsacceble
        else{
            error(req, res, "File the client is trying to acces is not accesable or doesnt exist")
            res.end()
            return
        }
    }
})

// runs when the server receives a post request to /favcolor
app.post("/favcolor", (req, res) =>{

    console.log("\n" + "POST request made to /favcolor")
    console.log("from ip: "+ req.ip  + "\n")

    res.writeHead(200, {"Content-Type" : "text/html"})
  
    res.write("<html><body style='background-color: "+ req.body.favColor +"'>A legrosszabb szin az ez</body></html>")

    res.end()
})

// websocket of the chat server
wss.on("connection", function connection(ws){
    console.log("\n" + "someone connected to the chat" + "\n")

    // sends the messages every time someone connects to the websocket
    ws.send(JSON.stringify(messages))

    // runs when server recieves a message to websocket
    ws.on('message', function message(data) {
        console.log("\n" + "new message made to chat: " + data.toString())

        messages.push(data.toString())

        // sends updated messages to every websocket
        wss.clients.forEach(function each(client){
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(messages))
            }
        })
            
    });
})

// listens on port
app.listen(port)
