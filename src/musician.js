const dgram = require('dgram');

const uuidv4 = require('uuid/v4');

const protocol = require('./musician-protocol');

const socket = dgram.createSocket('udp4');

const instrumentSound = {
  piano: 'ti-ta-ti',
  trumpet: 'pouet',
  flute: 'trulu',
  violin: 'gzi-gzi',
  drum: 'boum-boum',
};

function Musician(instrument) {
  this.instrument = instrument;
  this.sound = instrumentSound[instrument];
  this.uuid = uuidv4();

  Musician.prototype.play = () => {
    const music = {
      uuid: this.uuid,
      instrument: this.instrument,
      sound: this.sound,
    };
    const payload = JSON.stringify(music);

    const message = Buffer.from(payload);
    socket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, () => {
      console.log(`Sending payload: ${payload} via port ${socket.address().port}`);
    });
  };

  setInterval(this.play.bind(this), 1000);
}

const instrument = process.argv[2];

const musician = new Musician(instrument);
