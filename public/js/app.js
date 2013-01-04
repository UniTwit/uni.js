var socket = io.connect('http://ks.multoo.eu:1337');

socket.on('connect', function () {
      console.log('Connected !');
});

socket.on('dataValidation', function (data) {
      console.log(data);
});