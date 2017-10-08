const express = require('express')
const app = express()
const port = 3000;
var SerialPort = require('serialport');
var serial_port = new SerialPort('/dev/cu.usbmodem1421', function(err) {
 
  return console.log('Error: ', err.message);
});

app.post('/:value', (req, res) => {
  res.end();

  console.log(req.params.value)
  serial_port.write(req.params.value, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written' + req.params.value);
  });

  // Open errors will be emitted as an error event
  serial_port.on('error', function(err) {
    console.log('Error: ', err.message);
  })
})

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

