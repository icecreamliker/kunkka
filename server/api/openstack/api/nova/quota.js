'use strict';

var async = require('async');
var Base = require('../base.js');

function Overview(app) {
  this.app = app;
  this.arrService = ['nova', 'cinder', 'neutron'];
  this.arrQuotaObject = ['novaQuota', 'cinderQuota', 'neutronQuota'];
  this.arrListObject = ['servers', 'flavors', 'volumes', 'volumeTypes', 'security_groups', 'routers', 'subnets', 'floatingips', 'snapshots', 'keypairs', 'networks', 'ports'];
  this.arrServiceObject = this.arrQuotaObject.concat(this.arrListObject);
  Base.call(this, this.arrService, this.arrServiceObject);
}

var prototype = {
  getOverview: function (req, res, next) {
    var that = this;
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel(
      that.arrAsync,
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          obj.arrVolumeTypes = [];
          /* make up obj with serverObjects returned. */
          this.arrServiceObject.forEach( (e, index) => {
            obj[e] = results[index][Object.keys(results[index])[0]];
          });
          obj.overview_usage = {
            ram            : { total: obj.novaQuota.ram, used: 0 },
            cores          : { total: obj.novaQuota.cores, used: 0 },
            instances      : { total: obj.novaQuota.instances, used: 0 },
            key_pairs      : { total: obj.novaQuota.key_pairs, used: Object.keys(obj.keypairs).length },

            port           : { total: obj.neutronQuota.port, used: Object.keys(obj.ports).length },
            subnet         : { total: obj.neutronQuota.subnet, used: Object.keys(obj.subnets).length },
            router         : { total: obj.neutronQuota.router, used: Object.keys(obj.routers).length },
            network        : { total: obj.neutronQuota.network, used: Object.keys(obj.networks).length },
            floatingip     : { total: obj.neutronQuota.floatingip, used: Object.keys(obj.floatingips).length },
            security_group : { total: obj.neutronQuota.security_group, used: Object.keys(obj.security_groups).length },

            volumes        : { total: obj.cinderQuota.volumes, used: 0 },
            gigabytes      : { total: obj.cinderQuota.gigabytes, used: 0 },
            snapshots      : { total: obj.cinderQuota.snapshots, used: 0 }
          };
          obj.volumeTypes.forEach( a => {
            obj.overview_usage['volumes_' + a.name] = { total: obj.cinderQuota[ 'volumes_' + a.name], used: 0};
            obj.overview_usage['gigabytes_' + a.name] = { total: obj.cinderQuota[ 'gigabytes_' + a.name], used: 0};
            obj.overview_usage['snapshots_' + a.name] = { total: obj.cinderQuota[ 'snapshots_' + a.name], used: 0};
            obj.arrVolumeTypes.push(a.name);
          });
          /* deal with nova. */
          var flavor = {};
          obj.servers.forEach( s => {
            flavor[s.flavor.id] ? flavor[s.flavor.id]++ : flavor[s.flavor.id] = 1;
          });
          obj.flavors.forEach( f => {
            if (flavor[f.id]) {
              var num = flavor[f.id];
              obj.overview_usage.cores.used += num * f.vcpus;
              obj.overview_usage.ram.used += num * f.ram;
              obj.overview_usage.instances.used += num;
            } else {
              return;
            }
          });
          /* deal with cinder. */
          var snapshot = {};
          obj.snapshots.forEach( s => {
            obj.overview_usage.snapshots.used += 1;
            snapshot[s.volume_id] ? snapshot[s.volume_id]++ : snapshot[s.volume_id] = 1;
          });
          obj.volumes.forEach( v => {
            obj.overview_usage.volumes.used += 1;
            obj.overview_usage.gigabytes.used += v.size;
            var type = v.volume_type;
            if (obj.arrVolumeTypes.indexOf(type) !== -1) {
              obj.overview_usage['volumes_' + type].used += 1;
              obj.overview_usage['gigabytes_' + type].used += v.size;
              if (snapshot[v.id]) {
                obj.overview_usage['snapshots_' + type].used += snapshot[v.id];
              }
            }
          });
          /* sort by first letter. */

          res.json({
            overview_usage: obj.overview_usage,
            volume_types: obj.arrVolumeTypes
          });
        }
      }
    );
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/overview', this.getOverview.bind(this));
  }
};

module.exports = function (app, extension) {
  Object.assign(Overview.prototype, prototype, Base.prototype);
  if (extension) {
    Object.assign(Overview.prototype, extension);
  }
  var overview = new Overview(app);
  overview.initRoutes();
};