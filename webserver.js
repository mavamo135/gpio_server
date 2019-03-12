var http = require('http').createServer(handler)// Require http server, and create server with function handler()
var fs = require('fs')                          // Require filesystem module
var io = require('socket.io')(http)             // Require socket.io module and pass the http object (server)
var Gpio = require('bonescript')                // Include onoff to interact with the GPIO

var state = [Gpio.LOW, Gpio.LOW, Gpio.LOW, Gpio.LOW]
var leds = ["USR0", "USR1", "USR2", "USR3"]

// Listen to port 3002
http.listen(3002); 

// Set as outputs and turn off all LEDs
for (var i in leds) {
    Gpio.pinMode(leds[i], Gpio.OUTPUT)
    Gpio.digitalWrite(leds[i], state[i])
}

// Server connection handler function
function handler (req, res) { 
    // Read file index.html in public folder
    fs.readFile(__dirname + '/public/index.html', function(err, data) {
        if (err) {
            // Display 404 on error
            res.writeHead(404, {'Content-Type': 'text/html'}) 
            return res.end("404 Not Found")
        }
        res.writeHead(200, {'Content-Type': 'text/html'}) // Write HTML
        res.write(data) // Write data from index.html
        return res.end()
    })
}

io.sockets.on('connection', function (socket) {// WebSocket Connection
    socket.emit('led1', state[0]); //send led0 status to client
    socket.emit('led2', state[1]); //send led1 status to client
    socket.emit('led3', state[2]); //send led2 status to client
    socket.emit('led4', state[3]); //send led3 status to client
    socket.on('led1', function(data) { //get light switch status from client
        setLed(0, data)
    })
    socket.on('led2', function(data) { //get light switch status from client
        setLed(1, data)
    })
    socket.on('led3', function(data) { //get light switch status from client
        setLed(2, data)
    })
    socket.on('led4', function(data) { //get light switch status from client
        setLed(3, data)
    })
})

function setLed(led, value) {
    state[led] = value ? Gpio.HIGH : Gpio.LOW
    Gpio.digitalWrite(leds[led], state[led])
}

// On CTRL+C stop the server and turn off all LEDs
process.on('SIGINT', function () {
    for (var i in leds) {
        Gpio.digitalWrite(leds[i], Gpio.LOW)
    }
    process.exit()
})