var clientsTabWidgetsLoaded = false;

function doClientsTabSearch(value, name)
{
  doSearchCodeNameInTree('divClientsTG', value);
}

function doClientsTabWidgets()
{
  if (clientsTabWidgetsLoaded)
    return;

  clientsTabWidgetsLoaded = true;

  function doNewRoot()
  {
    doDlgClientNew(null, null);
  }

  function doNew()
  {
    doTreeGridGetSelectedRowData
    (
      'divClientsTG',
      function(row)
      {
        doDlgClientNew(row.id, null);
      }
    );
  }

  function doClear()
  {
    $('#divClientsTG').treegrid('unselectAll');
  }

  function doRemove()
  {
    var rows = $('#divClientsTG').datagrid('getSelections');

    if (rows.length == 0)
      doShowError('Please select one or more clients to remove');
    else if (rows.length == 1)
    {
      var row = rows[0];
      doPromptYesNoCancel
      (
        'Remove ' + row.name + ' and ALL subclients (Yes) or ONLY this client (No)?',
        function(result)
        {
          if (!_.isNull(result))
            doServerDataMessage('expireclient', {clientid: row.id, cascade: result}, {type: 'refresh'});
        }
      );
    }
    else
    {
      doPromptOkCancel
      (
        'Remove ' + rows.length + ' clients and ALL their subclients?',
        function(result)
        {
          if (!_.isNull(result))
          {
            rows.forEach
            (
              function(row)
              {
                doServerDataMessage('expireclient', {clientid: row.id, cascade: result}, {type: 'refresh'});
              }
            );
          }
        }
      );
    }
  }

  function doRefresh()
  {
    doSaved(null, null);
  }

  function doSearch()
  {
    doDlgClientSearch();
  }

  function doNotes()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divClientsTG',
        function(row)
        {
          doDlgClientNotes(row);
        }
      ))
    {
      doShowError('Please select a client to view');
    }
  }

  function doRemoveParent()
  {
    doTreeGridGetSelectedRowData
    (
      'divClientsTG',
      function(row)
      {
        doServerDataMessage('changeclientparent', {clientid: row.id, parentid: null}, {type: 'refresh'});
      }
    );
  }

  function doNewOrder()
  {
    if (!doTreeGridGetSelectedRowData
      (
        'divClientsTG',
        function(row)
        {
          $('#divEvents').trigger('new-client-order', row);
        }
      ))
    {
      doShowError('Please select a client to create order for');
    }
  }

  function doSaved(ev, args)
  {
    var pdata = {type: 'refresh'};

    if (!_.isUN(args))
      pdata.clientid = args.data.clientid;

    if (doLinkButtonSelected('tbClientsShowActive'))
      doServerDataMessage('listclients', {showinactive: false}, pdata);
    else if (doLinkButtonSelected('tbClientsShowInActive'))
      doServerDataMessage('listclients', {showinactive: true}, pdata);
    else
      doServerMessage('listclients', pdata);
  }

  function doShowActive(ev, args)
  {
    doServerDataMessage('listclients', {showinactive: false}, {type: 'refresh'});
  }
  
  function doShowInactive(ev, args)
  {
    doServerDataMessage('listclients', {showinactive: true}, {type: 'refresh'});
  }
  
  function doShowAll(ev, args)
  {
    doServerMessage('listclients', {type: 'refresh'});
  }

  // Refresh when these events occur...
  $('#divEvents').on
  (
    'listclients',
    function(ev, args)
    {
      $('#divClientsTG').treegrid('reload');

      doExpandTreeToId('divClientsTG', args.pdata.clientid);
    }
  );

  $('#divEvents').on('newclient', doSaved);
  $('#divEvents').on('saveclient', doSaved);
  $('#divEvents').on('expireclient', doSaved);
  $('#divEvents').on('changeclientparent', doSaved);
  $('#divEvents').on('clientcreated', doSaved);
  $('#divEvents').on('clientsaved', doSaved);
  $('#divEvents').on('clientexpired', doSaved);
  $('#divEvents').on('clientparentchanged', doSaved);
  $('#divEvents').on('savesupplier', doSaved);
  $('#divEvents').on('suppliersaved', doSaved);

  $('#divEvents').on
  (
    'checkclientcode',
    function(ev, args)
    {
      var clients = args.data.rs;

      if (clients.length > 0)
        doShowError('Client code [' + clients[0].code + '] is already assigned to [' + clients[0].name + ']');
    }
  );

  $('#divEvents').on
  (
    'clientspopup',
    function(ev, args)
    {
      if (args == 'newroot')
        doNewRoot();
      else if (args == 'new')
        doNew();
      else if (args == 'clear')
        doClear();
      else if (args == 'remove')
        doRemove();
      else if (args == 'refresh')
        doRefresh();
      else if (args == 'search')
        doSearch();
      else if (args == 'removeparent')
        doRemoveParent();
      else if (args == 'neworder')
        doNewOrder();
      else if (args == 'showactive')
        doShowActive();
      else if (args == 'showinactive')
        doShowInactive();
      else if (args == 'showall')
        doShowAll();
    }
  );

  $('#divClientsTG').treegrid
  (
    {
      idField: 'id',
      treeField: 'name',
      lines: true,
      collapsible: true,
      fitColumns: false,
      singleSelect: true,
      autoRowHeight: false,
      rownumbers: true,
      striped: true,
      toolbar: '#tbClients',
      showFooter: true,
      sortName: 'name',
      sortOrder: 'asc',
      remoteSort: false,
      multiSort: true,
      loader: function(param, success, error)
      {
        success({total: cache_clients.length, rows: cache_clients});
        $(this).treegrid('reloadFooter', [{name: '<span class="totals_footer">' + doGetCountTreeArray(cache_clients) + ' Clients</span>'}]);
      },
      frozenColumns:
      [
        [
          {title: 'Name',     field: 'name',     width: 300, align: 'left',   resizable: true, sortable: true},
          {title: 'Code',     field: 'code',     width: 200, align: 'left',   resizable: true, sortable: true}
        ]
      ],
      columns:
      [
        [
          {title: 'Active',   field: 'isactive', width: 80,  align: 'center', resizable: true, formatter: function(value, row) {return mapBoolToImage(value);}},
          {title: 'Modified', field: 'date',     width: 150, align: 'right',  resizable: true, sortable: true},
          {title: 'By',       field: 'by',       width: 200, align: 'left',   resizable: true, sortable: true}
        ]
      ],
      onContextMenu: function(e, row)
      {
        doTreeGridContextMenu('divClientsTG', 'divClientsMenuPopup', e, row);
      },
      onLoadSuccess: function(row)
      {
        $(this).treegrid('enableDnd');
      },
      onBeforeDrag: function(source)
      {
        return true;
      },
      onDragOver: function(target, source)
      {
        return _.isUN(target) ? false : true;
      },
      onBeforeDrop: function(target, source, point)
      {
        return true;
      },
      onDrop: function(target, source, point)
      {
        var t = _.isUN(target) ? null : target.id;

        doServerDataMessage('changeclientparent', {clientid: source.id, parentid: t}, {type: 'refresh'});
      },
      onDblClickCell: function(field, row)
      {
        doDlgClientNew(row.parentid, row.id);
      }
    }
  );
}

