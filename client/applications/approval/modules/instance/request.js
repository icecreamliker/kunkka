const storage = require('client/applications/approval/cores/storage');
const fetch = require('client/applications/approval/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['instance', 'image', 'network', 'subnet', 'keypair', 'flavor', 'port', 'floatingip', 'securitygroup', 'volume'], forced).then(function(data) {
      return data.instance;
    });
  },
  getPrices: function() {
    return fetch.get({
      url: '/proxy/gringotts/v2/products'
    });
  },
  deleteItem: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getSecuritygroupList: function() {
    return storage.getList(['securitygroup']).then((data) => {
      return data.securitygroup;
    });
  },
  getFloatingIpList: function() {
    return storage.getList(['floatingip']).then(function(data) {
      return data.floatingip;
    });
  },
  poweron: function(items) {
    let data = {};
    data['os-start'] = null;

    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.post({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
        data: data
      }));
    });
    return RSVP.all(deferredList);
  },
  poweroff: function(items) {
    let data = {};
    data['os-stop'] = null;

    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.post({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
        data: data
      }));
    });
    return RSVP.all(deferredList);
  },
  reboot: function(items) {
    let data = {};
    data.reboot = {};
    data.reboot.type = 'SOFT';

    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.post({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
        data: data
      }));
    });
    return RSVP.all(deferredList);
  },
  editServerName: function(item, newName) {
    let data = {};
    data.server = {};
    data.server.name = newName;

    return fetch.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id,
      data: data
    });
  },
  getVncConsole: function(item) {
    let data = {
      'os-getVNCConsole': {
        'type': 'novnc'
      }
    };

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/action',
      data: data
    });
  },
  getVolumeList: function(fetchVolumeTypes) {
    let deferredList = [];
    deferredList.push(storage.getList(['volume']));
    if (fetchVolumeTypes) {
      deferredList.push(fetch.get({
        url: '/proxy/cinder/v2/' + HALO.user.projectId + '/types'
      }));
    }
    return RSVP.all(deferredList);
  },
  getSubnetList: function() {
    return storage.getList(['subnet']).then(function(data) {
      return data.subnet;
    });
  },
  getPortList: function() {
    return storage.getList(['port']).then(function(data) {
      return data.port;
    });
  },
  deleteSnapshot: function(item) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/images/' + item.id
    });
  },
  createApplication: function(data) {
    return fetch.post({
      url: '/api/apply',
      data: data
    });
  },
  attachVolume: function(item, volumeId) {
    let data = {};
    data.volumeAttachment = {
      volumeId: volumeId
    };

    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/os-volume_attachments',
      data: data
    });
  },
  detachVolume: function(item) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.rawItem.id + '/os-volume_attachments/' + item.childItem.id
    });
  },
  joinNetwork: function(item, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id + '/os-interface',
      data: {
        interfaceAttachment: data
      }
    });
  },
  detachNetwork: function(item) {
    return fetch.delete({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.rawItem.id + '/os-interface/' + item.childItem.port.id
    });
  },
  getData: function() {
    return storage.getList(['flavor', 'image', 'securitygroup', 'network', 'keypair']).then(function(data) {
      return data;
    });
  },
  getFlavors: function() {
    return storage.getList(['flavor']).then(function(data) {
      return data.flavor;
    });
  },
  createInstance: function(data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers',
      data: {
        server: data
      }
    }).then(function(res) {
      return res.server;
    });
  },
  resizeInstance: function(serverId, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/action',
      data: data
    });
  },
  associateFloatingIp: function(serverId, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/action',
      data: data
    });
  },
  dissociateFloatingIp: function(serverId, data) {
    return fetch.post({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/action',
      data: data
    });
  },
  detachSomeVolume: function(serverId, items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/os-volume_attachments/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  updateSecurity: function(portId, data) {
    return fetch.put({
      url: '/proxy/neutron/v2.0/ports/' + portId,
      data: data
    });
  },
  createPort: function(port) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/ports',
      data: {
        port: port
      }
    });
  },
  updateOwner: function(serverId, data) {
    return fetch.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/metadata',
      data: data
    });
  },
  updateUsage: function(serverId, data) {
    return fetch.put({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + serverId + '/metadata',
      data: data
    });
  },
  getAlarmList(id) {
    let alarm = [], rule = '';
    return fetch.get({
      url: '/proxy/aodh/v2/alarms'
    }).then(function(data) {
      data && data.forEach(a => {
        rule = a.gnocchi_resources_threshold_rule;
        if (rule.resource_type === 'instance' && rule.resource_id === id) {
          a.timestamp = a.timestamp.split('.')[0] + 'Z';
          alarm.push(a);
        }
      });
      return alarm;
    });
  },
  getResourceMeasures: function(resourceId, type, granularity, start) {
    let deferredList = [];
    type.forEach((t) => {
      deferredList.push(fetch.get({
        url: '/proxy/gnocchi/v1/resource/generic/' + resourceId + '/metric/' + t + '/measures?granularity=' + granularity + '&start=' + start
      }));
    });
    return RSVP.all(deferredList);
  },
  getMeasures: function(id, granularity, start) {
    let url = '/proxy/gnocchi/v1/metric/' + id + '/measures?granularity=' + granularity + '&start=' + start;
    return fetch.get({
      url: url
    });
  },
  getNetworkResourceId: function(id) {
    let url = '/proxy/gnocchi/v1/search/resource/instance_network_interface',
      data = {
        '=': {
          instance_id: id
        }
      };
    return fetch.post({
      url: url,
      data: data
    });
  },
  getNetworkResource: function(granularity, start, _data, resourceData) {
    const addresses = _data.addresses;
    let ids = [], deferredList = [];
    for (let key in addresses) {
      addresses[key].filter((addr) => addr['OS-EXT-IPS:type'] === 'fixed').some((addrItem) => {
        resourceData.forEach(_portData => {
          if (addrItem.port.id.substr(0, 11) === _portData.name.substr(3)) {
            ids.push(_portData.metrics['network.incoming.bytes.rate']);
            ids.push(_portData.metrics['network.outgoing.bytes.rate']);
            ids.forEach(_id => {
              deferredList.push(this.getMeasures(_id, granularity, start));
            });
            ids = [];
          }
        });
      });
    }
    return RSVP.all(deferredList);
  },
  getActionLog: function(id) {
    return fetch.get({
      url: '/proxy/nova/v2.1/servers/' + id + '/os-instance-actions'
    });
  }
};
