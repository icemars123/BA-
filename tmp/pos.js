// *******************************************************************************************************************************************************************************************
// Internal functions
function doNewPOSOrder(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var clientid = __.isUndefined(world.clientid) || __.isNull(world.clientid) ? world.custconfig.posclientid : world.clientid;

      // Note: trigger will:
      //   insert an order status entry for us...
      //   fill in default addresses fields
      //   fill in default order/invoice templates...
      tx.query
      (
        'insert into orders (customers_id,orderno,clients_id,userscreated_id) values ($1,$2,$3,$4) returning id',
        [
          world.cn.custid,
          __.sanitiseAsString(world.orderno),
          __.sanitiseAsBigInt(clientid),

          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var orderid = result.rows[0].id;

            tx.query
            (
              'select o1.datecreated,u1.name usercreated from orders o1 left join users u1 on (o1.userscreated_id=u1.id) where o1.customers_id=$1 and o1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(orderid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var o = result.rows[0];

                  if (!__.isNull(world.products) && (world.products.length > 0))
                  {
                    var calls = [];

                    world.products.forEach
                    (
                      function(p)
                      {
                        world.version = 1;

                        calls.push
                        (
                          function(callback)
                          {
                            var od = null;
                            var version = 1;

                            global.modorders.doNewOrderDetail(tx, world.cn.custid, world.cn.userid, orderid, version, p.id, p.qty, p.exgst, p.discount, null).then
                            (
                              function(result)
                              {
                                od = result;

                                callback(null, {orderdetailid: od.orderdetailid});
                              }
                            );
                          }
                        );
                      }
                    );

                    global.async.series
                    (
                      calls,
                      function(err, results)
                      {
                        if (!err)
                        {
                          resolve
                          (
                            {
                              orderid: orderid,
                              orderno: world.orderno,
                              datecreated: global.moment(o.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                              usercreated: o.usercreated
                            }
                          );
                        }
                        else
                          reject(err);
                      }
                    );
                  }
                  else
                  {
                    resolve
                    (
                      {
                        orderid: orderid,
                        orderno: world.orderno,
                        datecreated: global.moment(o.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                        usercreated: o.usercreated
                      }
                    );
                  }
                }
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

// *******************************************************************************************************************************************************************************************
// Public functions
function POSGetProduct(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var code = __.sanitiseAsString(world.code);

        // Barcode reader adds check digit to end of the keyboard buffer...
        // Check if barcode prefix is one of ours... (the country/company fixed portion of the barcode)
        if (!__.isBlank(world.custconfig.currentbarcodeno))
        {
          if (code.substring(0, global.config.barcodes.prefixlength) == world.custconfig.currentbarcodeno.substring(0, global.config.barcodes.prefixlength))
            code = code.substring(0, code.length - 1);
        }

        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.code,' +
          'p1.name,' +
          'p1.barcode,' +
          'p1.costprice,' +
          'pc1.price exgst,' +
          'pc1.gst,' +
          'pc1.price + pc1.gst price,' +
          'p1.uomsize,' +
          'getproductinventorytotalforlocation($1,$2,p1.id) stockqty ' +
          'from ' +
          'products p1 left join pricing pc1 on (p1.id=pc1.products_id) ' +
          'where ' +
          'p1.customers_id=$3 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'and ' +
          '(' +
          'upper(p1.code)=upper($4) ' +
          'or ' +
          'upper(p1.barcode)=upper($5) ' +
          'or ' +
          'upper(p1.barcode2)=upper($6)' +
          ')',
          [
            world.cn.custid,
            global.config.pos.locationid_warehouse,
            world.cn.custid,
            code,
            code,
            code
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, product: result.rows[0], pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({posgetproduct: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({posgetproduct: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSGenBarcode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              global.modconfig.doNextBarcodeNo(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();

                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            barcodeno: result.barcodeno,
                            pdata: world.pdata
                          }
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({posgenbarcode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({posgenbarcode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({posgenbarcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
        }
        );
      }
      else
      {
        global.log.error({posgenbarcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSCashSale(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            var order = null;
            var cash = null;
            var total = null;
            var tendered = null;
            var change = null;

            if (!err)
            {
              global.modconfig.doNextOrderNo(tx, world).then
              (
                function(result)
                {
                  world.orderno = result.orderno;
                  //
                  return doNewPOSOrder(tx, world);
                }
              ).then
              (
                function(result)
                {
                  order = result;
                  total = __.toBigNum(world.total);
                  cash = __.toBigNum(world.cash);

                  if (cash.greaterThan(total))
                  {
                    tendered = cash;
                    change = cash.minus(total);
                    cash = total;
                  }

                  world.invoices =
                  [
                    {
                      orderid: order.orderid,
                      type: global.itype_paymenttype_cash,
                      reason: global.itype_paymentreason_pos,
                      amount: __.sanitiseAsPrice(cash, 2),
                      tendered: __.sanitiseAsPrice(tendered, 2),
                      change: __.sanitiseAsPrice(change, 2)
                    }
                  ];
                  return global.modinvoices.doPayment(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: __.sanitiseAsPrice(total, 2),
                            cash: __.sanitiseAsPrice(cash, 2),
                            tendered: __.sanitiseAsPrice(tendered, 2),
                            change: __.sanitiseAsPrice(change, 2),
                            datecreated: order.datecreated,
                            usercreated: order.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'ordercreated',
                          {
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: __.sanitiseAsPrice(total, 2),
                            cash: __.sanitiseAsPrice(cash, 2),
                            tendered: __.sanitiseAsPrice(tendered, 2),
                            change: __.sanitiseAsPrice(change, 2),
                            datecreated: order.datecreated,
                            usercreated: order.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({poscashsale: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({poscashsale: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({poscashsale: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({poscashsale: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSCreditSale(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            var order = null;

            if (!err)
            {
              global.modconfig.doNextOrderNo(tx, world).then
              (
                function(result)
                {
                  world.orderno = result.orderno;
                  //
                  return doNewPOSOrder(tx, world);
                }
              ).then
              (
                function(result)
                {
                  order = result;

                  world.invoices =
                  [
                    {
                      orderid: order.orderid,
                      type: global.itype_paymenttype_cc,
                      reason: global.itype_paymentreason_pos,
                      amount: world.credit,
                      tendered: null,
                      change: null
                    }
                  ];
                  return global.modinvoices.doPayment(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: world.total,
                            credit: world.credit,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'ordercreated',
                          {
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: world.total,
                            credit: world.credit,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({poscreditsale: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({poscreditsale: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({poscreditsale: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({poscreditsale: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSSplitSale(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            var order = null;

            if (!err)
            {
              global.modconfig.doNextOrderNo(tx, world).then
              (
                function(result)
                {
                  world.orderno = result.orderno;
                  //
                  return doNewPOSOrder(tx, world);
                }
              ).then
              (
                function(result)
                {
                  order = result;
                  world.invoices =
                  [
                    {
                      orderid: order.orderid,
                      type: global.itype_paymenttype_cash,
                      reason: global.itype_paymentreason_pos,
                      amount: world.cash,
                      tendered: world.cash,
                      change: null
                    },
                    {
                      orderid: order.orderid,
                      type: global.itype_paymenttype_cc,
                      reason: global.itype_paymentreason_pos,
                      amount: world.credit,
                      tendered: null,
                      change: null
                    }
                  ];
                  return global.modinvoices.doPayment(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: world.total,
                            cash: world.cash,
                            credit: world.credit,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'ordercreated',
                          {
                            orderid: order.orderid,
                            orderno: order.orderno,
                            total: world.total,
                            cash: world.cash,
                            credit: world.credit,
                            datecreated: order.datecreated,
                            usercreated: order.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({possplitsale: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({possplitsale: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({possplitsale: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({possplitsale: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSSearchSale(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'o1.id,' +
          'o1.orderno,' +
          'o1.datecreated,' +
          'o1.totalprice,' +
          'o1.totalgst,' +
          'od1.products_id productid,' +
          'od1.qty,' +
          'od1.price exgst,' +
          'od1.gst,' +
          'od1.price + od1.gst price,' +
          'od1.discount,' +
          'p1.code,' +
          'p1.name,' +
          'p1.uomsize,' +
          'y1.tendered,' +
          'y1.change,' +
          'y1.paymenttype ' +
          'from ' +
          'orders o1 left join orderdetails od1 on (o1.id=od1.orders_id) ' +
          '          left join products p1 on (od1.products_id=p1.id) ' +
          '          left join payments y1 on (o1.id=y1.orders_id) ' +
          'where ' +
          'o1.customers_id=$1 ' +
          'and ' +
          'o1.dateexpired is null ' +
          'and ' +
          'upper(o1.orderno)=upper($2)' ,
          [
            world.cn.custid,
            __.sanitiseAsString(world.orderno)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              result.rows.forEach
              (
                function(o)
                {
                  o.datecreated = global.moment(o.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, order: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({possearchsale: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({possearchsale: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function POSNewCust(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            var order = null;

            if (!err)
            {
              global.modconfig.doNextClientNo(tx, world).then
              (
                function(result)
                {
                  world.code = result.clientno;
                  world.issupplier = false;
                  world.isclient = true;
                  world.isactive = true;
                  world.country = global.config.defaults.defaultcountry;
                  return global.modclients.doNewClient(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            clientid: result.clientid,
                            code: world.code,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'poscustcreated',
                          {
                            clientid: result.clientid,
                            code: world.code,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                        // We also updated config (with new orderno) so let everyone know that too...
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'configsaved', {});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({posnewcust: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({posnewcust: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({posnewcust: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({posnewcust: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.POSGetProduct = POSGetProduct;
module.exports.POSGenBarcode = POSGenBarcode;
module.exports.POSCashSale = POSCashSale;
module.exports.POSCreditSale = POSCreditSale;
module.exports.POSSplitSale = POSSplitSale;
module.exports.POSSearchSale = POSSearchSale;
module.exports.POSNewCust = POSNewCust;
