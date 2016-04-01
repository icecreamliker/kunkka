var storage = require('client/dashboard/cores/storage');
var fetch = require('client/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['subnet', 'network', 'router', 'instance', 'port'], forced).then(function(data) {
      var subnets = data.subnet;
      subnets.forEach((subnet) => {
        subnet.port_security_enabled = subnet.network.port_security_enabled;
        subnet.ports.forEach((item) => {
          if (item.device_owner === 'network:router_interface') {
            data.router.some((r) => {
              if (r.id === item.device_id) {
                item.router = r;
                return true;
              }
              return false;
            });
          }
          if (item.device_owner.indexOf('compute') > -1) {
            data.instance.some((i) => {
              if (i.id === item.device_id) {
                item.server = i;
                return true;
              }
              return false;
            });
            if (!item.server) {
              item.server = {
                id: item.device_id,
                status: 'SOFT_DELETED'
              };
            }
          }
          if (item.device_owner) {
            item.status = 'ACTIVE';
          }
        });
      });
      return subnets;
    });
  },
  editSubnetName: function(item, newName) {
    var data = {};
    data.subnet = {};
    data.subnet.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/subnets/' + item.id,
      data: data
    });
  },
  deleteSubnets: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/subnets/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createSubnet: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/subnets',
      data: {
        subnet: data
      }
    });
  },
  updateSubnet: function(subnetId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/subnets/' + subnetId,
      data: {
        subnet: data
      }
    });
  },
  connectRouter: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/add_router_interface',
      data: data
    });
  },
  disconnectRouter: function(routerId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/routers/' + routerId + '/remove_router_interface',
      data: data
    });
  },
  addInstance: function(serverId, networkId) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/os-interface',
      data: networkId
    });
  },
  getNetworks: function() {
    return storage.getList(['network']).then(function(data) {
      return data.network.filter((n) => {
        if (n['router:external']) {
          return false;
        }
        return true;
      });
    });
  },
  getInstances: function() {
    return storage.getList(['instance']).then(function(data) {
      return data.instance;
    });
  },
  getRouters: function() {
    return storage.getList(['router']).then(function(data) {
      return data.router;
    });
  },
  deletePort: function(item) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/ports/' + item.id
    });
  },
  createPort: function(port) {
    var data = {
      port: port
    };
    return fetch.post({
      url: '/proxy/neutron/v2.0/ports',
      data: data
    });
  }
};
