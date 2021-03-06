const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/approval.lang.json');
const getErrorMessage = require('../../../../utils/error_message');
// let priceConverter = require('../../../../utils/price');

let gatewayId = null;
function pop(parent, callback) {

  // let enableCharge = HALO.settings.enable_charge;
  // config.fields[2].hide = !enableCharge;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      // config:{
      //   "type": "charge",
      //   "field": "charge",
      //   "has_label": true
      // }
      // function setPrice() {
      //   let price = HALO.prices.router.unit_price.price.segmented[0].price;

      //   refs.charge.setState({
      //     value: price
      //   });
      // }

      request.getGateway().then((res) => {
        if(res.length > 0) {
          gatewayId = res[0].id;
          if(res.length > 1) {
            gatewayId = '';
            refs.ex_networks = res;
            refs.external_network.setState({
              data: res,
              value: res[0].id,
              hide: false
            });
          }

          refs.btn.setState({
            disabled: false
          });
        }
      });

      // if (HALO.settings.enable_charge) {
      //   if (!HALO.prices) {
      //     request.getPrices().then((res) => {
      //       HALO.prices = priceConverter(res);
      //       setPrice();
      //     }).catch((error) => {});
      //   } else {
      //     setPrice();
      //   }
      // }
    },
    onConfirm: function(refs, cb) {
      let data = {};
      data.detail = {};
      let createDetail = data.detail;

      createDetail.create = [];
      let configCreate = createDetail.create;
      let createItem = {};
      createItem = {
        _type: 'Router',
        _identity: 'router',
        name: refs.name.state.value
      };

      if (refs.enable_public_gateway.state.checked) {
        createItem.external_gateway_info = {
          network: gatewayId ? gatewayId : refs.external_network.state.value
        };
      }

      configCreate.push(createItem);
      data.description = refs.apply_description.state.value;
      request.createRouter(data).then((res) => {
        callback && callback(res.router);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'enable_public_gateway':
          if(refs.enable_public_gateway.state.checked) {
            if(refs.ex_networks) {
              refs.external_network.setState({
                hide: false
              });
            }
          } else {
            refs.external_network.setState({
              hide: true
            });
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
