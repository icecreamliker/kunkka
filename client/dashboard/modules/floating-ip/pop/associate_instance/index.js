var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var createInstance = require('client/dashboard/modules/instance/pop/create_instance/index');

function pop(obj, callback, parent) {
  config.fields[0].text = obj.name;

  var props = {
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getInstances((instances) => {
        refs.instance.setState({
          data: instances,
          value: instances[0].id
        });
      });
    },
    onConfirm: function(refs, cb) {
      request.associateInstance(obj, refs.port.state.value).then((res) => {
        callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'instance':
          if (refs.instance.state.clicked) {
            createInstance((res) => {
              refs.instance.setState({
                data: [res],
                value: res.id,
                clicked: false
              });
              refs.btn.setState({
                disabled: false
              });
            }, refs.modal);
          } else {
            var instances = refs.instance.state.data;
            var selected = refs.instance.state.value;

            var item = instances.filter((instance) => instance.id === selected)[0];

            if (instances.length > 0) {
              var ports = [];
              var addresses = item.addresses;

              for (let key in addresses) {
                for (let ele of addresses[key]) {
                  if (ele['OS-EXT-IPS:type'] === 'fixed') {
                    ports.push({
                      id: ele.port.id,
                      name: ele.addr
                    });
                  }
                }
              }

              refs.port.setState({
                data: ports,
                value: ports[0].id,
                hide: false
              });
            }
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;