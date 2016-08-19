var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');

function pop(obj, isDetail, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.substr(0, 8) + ')';

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances().then((data) => {
        if (data.length > 0) {
          refs.instance.setState({
            data: data,
            value: data[0].id
          });
          refs.btn.setState({
            disabled: false
          });
        }
      });
    },
    onConfirm: function(refs, cb) {
      var networkId = {};
      if (isDetail) {
        networkId = {
          interfaceAttachment: {
            port_id: obj.id
          }
        };
        request.addInstance(refs.instance.state.value, networkId).then((res) => {
          callback && callback(res);
          cb(true);
        });
      } else {
        var port = {
          network_id: obj.network_id,
          fixed_ips: [{
            subnet_id: obj.id
          }],
          port_security_enabled: obj.portSecurityEnabled
        };
        request.createPort(port).then((p) => {
          networkId = {
            interfaceAttachment: {
              port_id: p.port.id
            }
          };
          request.addInstance(refs.instance.state.value, networkId).then((res) => {
            callback && callback(res);
            cb(true);
          });
        });
      }
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;
