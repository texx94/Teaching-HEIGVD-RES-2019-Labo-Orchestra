const dgram = require('dgram');
const moment = require('moment');
const net = require('net');
const protocol = require('./musician-protocol');

const socket = dgram.createSocket('udp4');
socket.bind(protocol.PROTOCOL_PORT, () => {
  console.log('Joining multicast group');
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

const orchestra = new Map();
socket.on('message', (msg, source) => {
  console.log(`data has arrived: ${msg}. Source port: ${source.port}`);

  const musician = JSON.parse(msg);

  if (orchestra.has(musician.uuid)) {
    orchestra.get(musician.uuid).lastSound = moment().toISOString();
  } else {
    orchestra.set(musician.uuid, {
      firstSound: moment().toISOString(),
      lastSound: moment().toISOString(),
      instrument: musician.instrument,
    });
  }
});

const TCPServ = net.createServer();
TCPServ.listen(protocol.PROTOCOL_PORT);
TCPServ.on('connection', (TCPSocket) => {
  const payload = [];
  orchestra.forEach((value, key) => {
    if (moment().diff(value.lastSound, 'seconds') > 5) {
      orchestra.delete(key);
    } else {
      const item = {
        uuid: key,
        instrument: value.instrument,
        activeSince: value.firstSound,
      };
      payload.push(item);
    }
  });

  TCPSocket.write(JSON.stringify(payload));
  TCPSocket.write('\r\n');
  TCPSocket.end();
});
