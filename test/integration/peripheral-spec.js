var should = require('should');
var Gateway = require('../../lib/gateway');

/**
 * These tests perform operations against live Losant devices. In order for
 * these test to correctly run, the following must be setup:
 * Standalone device with { temperature : Number } attribute.
 * Workflow that triggers on standalone device and sends command back to device.
 * Gateway with { temperature : Number } attribute.
 * Peripheral with { temperature: Number } attribute.
 */

var gatewayDeviceId = process.env['GATEWAY_DEVICE_ID'] || '577bd4699623b80100e3b235';
var peripheralDeviceId = process.env['PERIPHERAL_DEVICE_ID'] || '577bd49b7b3f830100d9379c';
var accessKey = process.env['ACCESS_KEY'] || '59fcf8b7-0186-4385-9a74-c8292ed25470';
var accessSecret = process.env['ACCESS_SECRET'];

var should = require('should');
var Device = require('../../lib/device');

describe('Peripheral', function() {
  it('should connect, send state, and receive a command', function(done) {

    this.timeout(8000);

    var gateway = new Gateway({
      id: gatewayDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    var peripheral = gateway.addPeripheral(peripheralDeviceId);

    gateway.connect(function() {
      peripheral.sendState({ temperature: 75 });
    });

    peripheral.on('command', function(command) {
      command.payload.temperature.should.equal(75);
      gateway.disconnect(done);
    });
  });

  it('should reconnect, send state, and receive command', function(done) {

    this.timeout(8000);

    var gateway = new Gateway({
      id: gatewayDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    var peripheral = gateway.addPeripheral(peripheralDeviceId);

    gateway.connect(function(err) {
      gateway.mqtt.client.stream.end();
    });

    gateway.on('reconnect', function() {
      setTimeout(function() {
        peripheral.sendState({ temperature: 65 });
      }, 500);
    });

    peripheral.on('command', function(command) {
      command.payload.temperature.should.equal(65);
      gateway.disconnect(done);
    });
  });

});
