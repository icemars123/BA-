var quotesTabWidgetsLoaded = false;

function doQuotesTabWidgets()
{
  var versions = [];

  if (quotesTabWidgetsLoaded)
    return;

  quotesTabWidgetsLoaded = true;

  function doNew()
  {
    doDlgOrderNew(true, null);
  }

  function doClear()
  {
    $('#divQuotesG').datagrid('clearSelections');
  }

  function doRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divQuotesG',
        function(row)
        {
          if (_.isBlank(row.invoiceno) && _.isBlank(row.orderno))
          {
            doPromptOkCancel
            (
              'Remove quote ' + row.quoteno + '?',
              function(result)
              {
                if (result)
                  doServerDataMessage('expireorder', {orderid: row.id}, {type: 'refresh'});
              }
            );
          }
          else
            doShowWarning('Can not remove an invoiced or ordered quote');
        }
      ))
    {
      doShowError('Please select an quote to remove');
    }
  }

  function doRefresh()
  {
    doServerMessage('listquotes', {type: 'refresh'});
  }

  function doPrint()
  {
    // doGridGetSelectedRowData
    // (
    //   'divQuotesG',
    //   function(row)
    //   {
    //     doServerDataMessage('printorders', {quotes: [row.id]}, {type: 'refresh'});
    //   }
    // );
  }

  function doEmail()
  {
    // if (!doGridGetSelectedRowData
    //   (
    //     'divQuotesG',
    //     function(row)
    //     {
    //       doDlgEmailOrder(row, itype_order_order);
    //     }
    //   ))
    // {
    //   doShowError('Please select an quote to email');
    // }
  }

  function doDuplicate()
  {
    if (!doGridGetSelectedRowData
      (
        'divQuotesG',
        function(row)
        {
          doPromptOkCancel
          (
            'Duplicate quote ' + row.quoteno + '?',
            function(result)
            {
              if (result)
                doServerDataMessage('duplicateorder', {isquote: true, orderid: row.id}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select a quote to duplicate');
    }
  }

  function doNewVersion()
  {
    if (!doGridGetSelectedRowData
      (
        'divQuotesG',
        function(row)
        {
          if (_.isBlank(row.invoiceno) && _.isBlank(row.orderno))
          {
            doPromptOkCancel
            (
              'Create new version from version ' + row.activeversion + ' of ' + row.quoteno + '?',
              function(result)
              {
                if (result)
                  doServerDataMessage('newversionorder', {orderid: row.id, version: row.activeversion}, {type: 'refresh'});
              }
            );
          }
          else
            doShowWarning('Can not create new version of an invoiced or ordered quote');
        }
      ))
    {
      doShowError('Please select an quote');
    }
  }

  function doSearch()
  {
    doDlgQuoteSearch();
  }

  function doInvoice()
  {
    if (!doGridGetSelectedRowData
      (
        'divQuotesG',
        function(row)
        {
          if (_.isBlank(row.invoiceno))
          {
            doPromptOkCancel
            (
              'Convert quote #' + row.quoteno + ' to invoice?',
              function(result)
              {
                if (result)
                  doServerDataMessage('createinvoicefromquote', {orderid: row.id}, {type: 'refresh'});
              }
            );
          }
          else
            doShowWarning('Quote has already been invoiced');
        }
      ))
    {
      doShowError('Please select an quote to invoice');
    }
  }

  function doSaved(ev, args)
  {
    doServerMessage('listquotes', {type: 'refresh', orderid: args.data.orderid});
  }

  function doFooter(data)
  {
    var totalprice = _.toBigNum(0.0);
    var totalqty = _.toBigNum(0.0);

    data.forEach
    (
      function(o)
      {
        if (!_.isBlank(o.totalprice))
          totalprice = totalprice.plus(o.totalprice);

        if (!_.isBlank(o.totalqty))
          totalqty = totalqty.plus(o.totalqty);
      }
    );

    $('#divQuotesG').datagrid
    (
      'reloadFooter',
      [
        {
          quoteno: '<span class="totals_footer">' + data.length + ' order(s)</span>',
          totalprice: '<span class="totals_footer">' + _.niceformatnumber(totalprice) + '</span>',
          totalqty: '<span class="totals_footer">' + _.niceformatnumber(totalqty) + '</span>'
        }
      ]
    );
  }

  // Respond to these events...
  $('#divEvents').on
  (
    'searchorders',
    function(ev, args)
    {
    }
  );

  $('#divEvents').on
  (
    'listquotes',
    function(ev, args)
    {
      var data = [];

      args.data.rs.forEach
      (
        function(o)
        {
          data.push
          (
            {
              id: doNiceId(o.id),
              clientid: doNiceId(o.clientid),
              quoteno: doNiceString(o.quoteno),
              orderno: doNiceString(o.orderno),
              invoiceno: doNiceString(o.invoiceno),
              name: doNiceString(o.name),
              pono: doNiceString(o.pono),
              numversions: _.formatinteger(o.numversions),
              activeversion: _.formatinteger(o.activeversion),
              startdate: _.nicedatetodisplay(o.startdate),
              enddate: _.nicedatetodisplay(o.enddate),
              totalprice: _.sanitiseAsNumeric(o.totalprice, 4),
              totalqty: _.sanitiseAsNumeric(o.totalqty, 4),
              isrepeat: o.isrepeat,
              isnewartwork: o.isnewartwork,
              status: doGetStringFromIdInObjArray(orderstatustypes, o.status),
              attachmentid: doNiceId(o.attachmentid),
              attachmentname: doNiceString(o.attachmentname),
              attachmentimage: doNiceString(o.attachmentimage),
              date: doNiceDateModifiedOrCreated(o.datemodified, o.datecreated),
              by: doNiceModifiedBy(o.datemodified, o.usermodified, o.usercreated)
            }
          );
        }
      );

      $('#divQuotesG').datagrid('loadData', data);
      doFooter(data);

      doGridSelectRowById('divQuotesG', args.pdata.orderid);
    }
  );

  $('#divEvents').on('neworder', doSaved);
  $('#divEvents').on('saveorder', doSaved);
  $('#divEvents').on('expireorder', doSaved);
  $('#divEvents').on('newversionorder', doSaved);
  $('#divEvents').on('ordernewversion', doSaved);
  $('#divEvents').on('neworderdetail', doSaved);
  $('#divEvents').on('saveorderdetail', doSaved);
  $('#divEvents').on('expireorderdetail', doSaved);
  $('#divEvents').on('orderdetailcreated', doSaved);
  $('#divEvents').on('orderdetailsaved', doSaved);
  $('#divEvents').on('orderduplicated', doSaved);
  $('#divEvents').on('orderdetailexpired', doSaved);
  $('#divEvents').on('orderattachmentsaved', doSaved);
  $('#divEvents').on('orderattachmentexpired', doSaved);
  $('#divEvents').on('neworderstatus', doSaved);
  $('#divEvents').on('orderstatuscreated', doSaved);
  $('#divEvents').on('ordercreated', doSaved);
  $('#divEvents').on('ordersaved', doSaved);
  $('#divEvents').on('orderexpired', doSaved);
  $('#divEvents').on('saveaccount', doSaved);
  $('#divEvents').on('saveclient', doSaved);
  $('#divEvents').on('clientsaved', doSaved);
  $('#divEvents').on('inventoryadded', doSaved);
  $('#divEvents').on('invoicecreated', doSaved);

  $('#divEvents').on
  (
    'duplicateorder',
    function(ev, args)
    {
      if (!_.isUN(args.data.quoteno))
      {
        doShowWarning('New quote ' + args.data.quoteno + ' created');
        doServerMessage('listquotes', {type: 'refresh'});
      }
    }
  );

  $('#divEvents').on
  (
    'new-client-quote',
    function(ev, args)
    {
      doSelectSalesTab('Quotes');
    }
  );

  $('#divEvents').on
  (
    'selectquoteid',
    function(ev, args)
    {
      // TODO: This doesn't work if TAB hasn't already been opened/populated yet...
      if (!_.isUndefined(args.id) && !_.isNull(args.id))
        $('#divQuotesG').datagrid('selectRecord', args.id);
    }
  );

  $('#divEvents').on
  (
    'quotespopup',
    function(ev, args)
    {
      if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'remove')
        doRemove();
      else if (args == 'refresh')
        doRefresh();
      else if (args == 'print')
        doPrint();
      else if (args == 'email')
        doEmail();
      else if (args == 'duplicate')
        doDuplicate();
      else if (args == 'newversion')
        doNewVersion();
      else if (args == 'search')
        doSearch();
      else if (args == 'deposit')
        doDeposit();
      else if (args == 'invoice')
        doInvoice();
      else if (args == 'jobsheet')
        doJobSheet();
    }
  );

  // Check user permissions for this TAB...
  if (!isadmin && !myperms.cancreateorders)
  {
    /*
    doRemoveTBButton(tb, 'New');
    doRemoveTBButton(tb, 'Save');
    doRemoveTBButton(tb, 'Remove');
    doRemoveTBButton(tb, 'Duplicate');
    doRemoveTBButton(tb, 'Products');
    doRemoveTBButton(tb, 'Statuses');
    doRemoveTBButton(tb, 'Notes');
    doRemoveTBButton(tb, 'Attachments');
    doRemoveTBButton(tb, 'New Version');
    doRemoveTBButton(tb, 'Invoice');
    */
  }

  quoteInvoiceToStates = doGetStatesFromCountry(defaultCountry);
  quoteShipToStates = doGetStatesFromCountry(defaultCountry);

  $('#divQuotesG').datagrid
  (
    {
      idField: 'id',
      fitColumns: false,
      singleSelect: true,
      rownumbers: true,
      striped: true,
      toolbar: '#tbQuotes',
      showFooter: true,
      sortName: 'quoteno',
      sortOrder: 'desc',
      remoteSort: false,
      multiSort: true,
      autoRowHeight: false,
      view: groupview,
      groupField: 'status',
      frozenColumns:
      [
        [
          {title: 'Quote #',         rowspan: 2,  field: 'quoteno',            width: 150,  align: 'left',  resizable: true, sortable: true}
        ],
        [
        ]
      ],
      columns:
      [
        [
          {title: 'Name',            rowspan: 2,  field: 'name',               width: 300, align: 'left',   resizable: true, sortable: true},
          {title: 'P.O.#',           rowspan: 2,  field: 'pono',               width: 150, align: 'left',   resizable: true, sortable: true},
          {title: 'Client',          rowspan: 2,  field: 'clientid',           width: 300, align: 'left',   resizable: true, formatter: function(value, row) {return doGetNameFromTreeArray(cache_clients, value);}, sortable: true},
          {title: 'Version',         rowspan: 2,  field: 'activeversion',      width: 100, align: 'right',  resizable: true},
          {title: 'Status',          rowspan: 2,  field: 'status',             width: 200, align: 'left',   resizable: true},
          {title: 'Total',           rowspan: 2,  field: 'totalprice',         width: 150, align: 'right',  resizable: true, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatnumber(value); return value;}},
          {title: 'Qty',             rowspan: 2,  field: 'totalqty',           width: 150, align: 'right',  resizable: true, formatter: function(value, row, index) {if (!_.isUndefined(row.id)) return _.niceformatqty(value); return value;}},
          {title: 'Date',            colspan: 2},
          {title: 'Modified',        rowspan: 2,  field: 'date',               width: 150, align: 'right',  resizable: true, sortable: true},
          {title: 'By',              rowspan: 2,  field: 'by',                 width: 200, align: 'left',   resizable: true, sortable: true}
        ],
        [
          {title: 'Start',                        field: 'startdate',          width: 150, align: 'right',  resizable: true, formatter: function(value, row) {return _.nicedatetodisplay(value);}, sortable: true},
          {title: 'Required',                     field: 'enddate',            width: 150, align: 'right',  resizable: true, formatter: function(value, row) {return _.nicedatetodisplay(value);}, sortable: true}
        ]
      ],
      groupFormatter: function(value, rows)
      {
        return value + ' - ' + rows.length + ' quote(s)';
      },
      onRowContextMenu: function(e, index, row)
      {
        doGridContextMenu('divQuotesG', 'divQuotesMenuPopup', e, index, row);
      },
      onBeginEdit: function(rowIndex)
      {
      },
      onDblClickCell: function(index, field, value)
      {
        doGetGridGetRowDataByIndex
        (
          'divQuotesG',
          index,
          function(row)
          {
            doDlgOrderNew(true, row.id);
          }
        );
      }
    }
  );

  if (posonly)
  {
    $('#divQuotesG').datagrid('hideColumn', 'pono');
    $('#divQuotesG').datagrid('hideColumn', 'activeversion');
    $('#divQuotesG').datagrid('hideColumn', 'startdate');
    $('#divQuotesG').datagrid('hideColumn', 'enddate');
  }

  doServerMessage('listquotes', {type: 'refresh'});
}
