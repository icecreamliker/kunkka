var storage = require('client/dashboard/cores/storage');
var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb, forced) {
    return storage.getList(['network'], forced).then(function(data) {
      cb(data.network);
    });
  },
  editNetworkName: function(item, newName) {
    var data = {};
    data.network = {};
    data.network.name = newName;

    return request.put({
      url: '/proxy/neutron/v2.0/networks/' + item.id,
      data: data
    });
  }
};
