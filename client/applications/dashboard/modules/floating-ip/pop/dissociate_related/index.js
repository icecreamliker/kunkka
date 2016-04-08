var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('i18n/client/dashboard.lang.json');

function pop(obj, parent, callback) {
  config.fields[1].text = obj.name;
  config.fields[2].text = obj.association.device.name;

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {

    },
    onConfirm: function(refs, cb) {
      request.dissociateInstance(obj).then((res) => {
        callback && callback(res.floatingip);
        cb(true);
      });
    },
    onAnction: function(field, status, refs) {

    }
  };

  commonModal(props);
}

module.exports = pop;