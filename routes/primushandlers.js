// TODO: Instead of calling refreshFromCacheXXXXX() methods directly from here - use fireEvent on divEvents... so makes methods independent and also allows  multiple dependencies to auto consume the event....
//       See dlg-build-template-details.js for example consumption/usage...
function addChannels(c)
{
  if (_.isArray(c))
  {
    c.forEach
    (
      function(chan)
      {
        if (channels.indexOf(chan) == -1)
          channels.push(chan);
      }
    );
  }
  else
  {
    if (channels.indexOf(c) == -1)
      channels.push(c);
  }
}

function doJoinChannels()
{
  if (!_.isUN(channels))
  {
    channels.forEach
    (
      function(channel)
      {
        primus.emit
        (
          'join',
          {
            fguid: fguid,
            uuid: uuid,
            session: session,
            channel: channel,
            pdata: 'join'
          }
        );
      }
    );
  }
}

function doPrimus()
{
  try
  {
    console.log('***** Init Primus...');
    primus = new Primus
    (
      server,
      {
        reconnect: {maxDelay: 15 * 1000, minDelay: 1000, retries: 1000},
        strategy: ['disconnect', 'timeout']
      }
    );

    // Add error listener as soon as possible after open - so we can catch connection errors...
    primus.on
    (
      'error',
      function(err)
      {
        // Note we get a connection error first if we get "disconnected", then an "offline"" event, finally a "close" event...
        // We mark disconnection here as we will get this event faster than an "offline" or "close" event - especially after a pause/resumed cycle where we need to detect and force a reconnect quickly...
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64disconnected + '" width="24" height="24"/> Oops, server may be lost...');
        connected = false;
      }
    );

    // Connection events from primus itself...
    primus.on
    (
      'open',
      function()
      {
        $('#divDashConnectionStatus').html(document.createTextNode('Connected to server...'));
        connected = true;
        if (firstconnection)
        {
          if (annyang)
          {
            if (!ispos)
              noty({text: 'Your browser supports speech recognition - Click Allow Microphone Access..."', type: 'success', timeout: 5000});
          }
          firstconnection = false;
        }
        // We also get here after a temporary disconnection -  so we need to rejoin channels as server would have dumped us...
        doJoinChannels();
      }
    );

    primus.on
    (
      'close',
      function()
      {
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64disconnected + '" width="24" height="24"/> OK, server has gone away, don\'t worry, will look for it shortly...');
        console.log('***** Server has gone away...');
      }
    );

    primus.on
    (
      'end',
      function()
      {
        console.log('***** Connection ended...');
      }
    );

    primus.on
    (
      'reconnecting',
      function(opts)
      {
        var s = opts.timeout / 1000;

        s = s.toFixed(0);
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64searching + '" width="24" height="24"/> Sending search party for server in ' + s + 's, retry ' + opts.attempt + ' of ' + opts.retries);
        console.log('***** Reconecting in ' + s + 's');
      }
    );

    primus.on
    (
      'reconnect',
      function()
      {
        $('#divDashConnectionStatus').html('<img style="vertical-align: middle;" src="data:image/png;base64,' + b64gears + '" width="24" height="24"/> Looking for server now...');
        console.log('***** Looking for server...');
      }
    );

    // Auth events
    primus.on
    (
      'welcome',
      function(data)
      {
        fguid = data.fguid;
        //
        console.log('***** Server welcome...');
        //
        addChannels(data.channel);
        showIdle();
        $('#divEvents').trigger('poswelcome', {pdata: 'none'});
      }
    );

    primus.on
    (
      'join',
      function(data)
      {
      }
    );

    primus.on
    (
      'login',
      function(data)
      {
        console.log('***** Login successful...');

        uid = data.uid;
        uname = data.uname;
        uuid = data.uuid;
        isadmin = data.isadmin;
        isclient = data.isclient;
        clientid = data.clientid;
        avatar = data.avatar;
        myperms = data.permissions;
        session = data.session;

        if (isclient)
        {
          noty({text: 'Access denied... please use client login', type: 'error'});
          return;
        }
        /*
        noty
        (
          {
            text: 'Login successful...',
            type: 'success',
            force: true,
            killer: true,
            timeout: 4000,
            callback:
            {
              onShow: function()
              {
                addChannels(data.channels);
                doJoinChannels();
                //
                $('#spnMenu').html('Logged in as <strong>' + _.titleize(uname) + '</strong>');
                $('#spnServer').text(server);
                $('#divEvents').trigger('refresh-all', {pdata: 'none'});
                $('#dlgLogin').dialog('close');
              }
            }
          }
        );
        */

        addChannels(data.channels);
        doJoinChannels();

        // Display login details
        var imgAvatar = mapAvatarToImage(avatar);

        if (_.isBlank(imgAvatar))
          $('#spnMenu').html('Logged in as <strong>' + _.titleize(uname) + '</strong>');
        else
        {
          $('#spnMenu').html
          (
            '<table><tr>' +
              '<td valign="middle">' + imgAvatar + '</td>' +
              '<td valign="middle">Logged in as <strong>' + _.titleize(uname) + '</strong></td>' +
            '</tr></table>'
          );
        }

        // Indicate which server we're connected to and close login dialog...
        $('#spnServer').text(server);
        $('#dlgLogin').dialog('close');

        if (!ispos)
        {
          // Trigger refresh/load of all data...
          $('#divEvents').trigger('refresh-all', {pdata: 'none'});

          console.log('***** Determining permissions...');

          if (posonly)
          {
            $('#as1tabs').tabs('close', 'Command TAB');
            $('#as1tabs').tabs('close', 'Dashboard');
            $('#as1tabs').tabs('close', 'Purchasing');
            $('#as1tabs').tabs('close', 'Job Sheets');
            $('#as1tabs').tabs('close', 'Payroll');
            $('#as1tabs').tabs('close', 'Accounts');

            $('#dashtabs').tabs('close', 'Alerts');
            $('#dashtabs').tabs('close', 'Chat Support');
            $('#dashtabs').tabs('close', 'Order Cards');

            $('#salestabs').tabs('close', 'Invoices');

            $('#inventorytabs').tabs('close', 'Build Templates');
            $('#inventorytabs').tabs('close', 'Builds');

            $('#maintenancetabs').tabs('close', 'Status Alerts');
            $('#maintenancetabs').tabs('close', 'Permission Templates');
            $('#maintenancetabs').tabs('close', 'Product Templates');
            $('#maintenancetabs').tabs('close', 'Print Templates');
            $('#maintenancetabs').tabs('close', 'Emails');

            if (!isadmin)
            {
              // Inventory
              if (!myperms.canviewinventory)
                $('#as1tabs').tabs('close', 'Inventory');

              $('#as1tabs').tabs('close', 'Maintenance');
              $('#salestabs').tabs('close', 'Clients');
            }
          }
          else
          {
            // Close TABs where user permissions deny viewing
            // Can't handle creation permissions here since TAB panels are not yet loaded...
            if (!isadmin)
            {
              console.log(myperms);
              // Alerts
              if (!myperms.canviewalerts)
              {
                $('#dashtabs').tabs('close', 'Alerts');
                $('#maintenancetabs').tabs('close', 'Status Alerts');
              }

              // Codes
              if (!myperms.canviewcodes)
              {
                $('#as1tabs').tabs('close', 'Accounts');
              }

              // Orders
              if (!myperms.canvieworders)
              {
                $('#dashtabs').tabs('close', 'Order Cards');
                $('#salestabs').tabs('close', 'Orders');
              }

              if (!myperms.cancreateorders)
              {
                // Can't change/add orders
                $('#tbOrdersNew').hide();
                $('#tbOrdersRemove').hide();
                $('#tbOrdersDuplicate').hide();
                $('#tbOrdersDeposit').hide();
                $('#tbOrdersInvoice').hide();

                // Can't change/add products
                $('#tbOrderNewNew').hide();
                $('#tbOrderNewEdit').hide();
                $('#tbOrderNewCancel').hide();
                $('#tbOrderNewSave').hide();
                $('#tbOrderNewRemove').hide();

                // Can't change/add notes
                $('#tbOrderNoteNew').hide();
                $('#tbOrderNoteEdit').hide();
                $('#tbOrderNoteCancel').hide();
                $('#tbOrderNoteSave').hide();
                $('#tbOrderNoteRemove').hide();

                // Can't change/add attachments
                $('#tbOrderAttachmentEdit').hide();
                $('#tbOrderAttachmentCancel').hide();
                $('#tbOrderAttachmentSave').hide();
                $('#tbOrderAttachmentRemove').hide();
              }

              // Invoices
              if (!myperms.canviewinvoices)
              {
                $('#salestabs').tabs('close', 'Invoices');
              }

              // Clients
              if (!myperms.canviewclients)
              {
                $('#salestabs').tabs('close', 'Clients');
                $('#salestabs').tabs('close', 'Suppliers');
              }

              // Purchasing
              if (!myperms.canviewpurchasing)
              {
                $('#as1tabs').tabs('close', 'Purchasing');
              }

              // Inventory
              if (!myperms.canviewinventory)
              {
                $('#inventorytabs').tabs('close', 'Locations');
                $('#inventorytabs').tabs('close', 'Stock');
              }

              // Products
              if (!myperms.canviewproducts)
              {
                $('#inventorytabs').tabs('close', 'Products');
                $('#inventorytabs').tabs('close', 'Categories');
              }

              // Builds
              if (!myperms.canviewbuilds)
              {
                $('#inventorytabs').tabs('close', 'Build Templates');
              }

              // Banking
              if (!myperms.canviewbanking)
              {
                $('#as1tabs').tabs('close', 'Banking');
              }

              // Payroll
              if (!myperms.canviewpayroll)
              {
                $('#as1tabs').tabs('close', 'Payroll');
              }

              // Users
              if (!myperms.canviewusers)
              {
                $('#maintenancetabs').tabs('close', 'Users');
              }

              // Templates
              if (!myperms.canviewtemplates)
              {
                $('#maintenancetabs').tabs('close', 'Permission Templates');
                $('#maintenancetabs').tabs('close', 'Product Templates');
                $('#maintenancetabs').tabs('close', 'Print Templates');
              }

              // Command centre permissions...
              var allowednodes = [cmdcentreConfig, noderoot];

              // Note: order of node removal important, go from deepest to top as we're simply removing array elements...
              if (!myperms.canviewclients)
                nodesales.children[0].children[0].children.splice(0, 1);

              if (!myperms.canviewinvoices)
                nodesales.children[0].children.splice(0, 1);

              if (myperms.canvieworders)
                allowednodes.push(nodesales);

              //
              if (!myperms.canviewbuilds)
                nodeinventory.children.splice(1, 1);

              if (!myperms.canviewproducts)
                nodeinventory.children[0].children.splice(0, 1);

              if (myperms.canviewinventory)
              {
                allowednodes.push(nodejobsheets);
                allowednodes.push(nodeinventory);
              }

              //
              if (myperms.canviewcodesl)
                allowednodes.push(nodeaccounts);

              if (myperms.canviewpayroll)
                allowednodes.push(nodepayroll);

              // If can't view users and templates, then may as well close all of maintenance TAB...
              if (!myperms.canviewusers && !myperms.canviewtemplates)
                $('#as1tabs').tabs('close', 'Maintenance');
              else
              {
                $('#maintenancetabs').tabs('close', 'Status Alerts');
                $('#maintenancetabs').tabs('close', 'Permission Templates');
                $('#maintenancetabs').tabs('close', 'Product Templates');
                $('#maintenancetabs').tabs('close', 'Print Templates');

                $('#maintenancetabs').tabs('close', 'Emails');
                $('#maintenancetabs').tabs('close', 'Settings');
              }

              if (!ispos)
                cmdcentre = new Treant(allowednodes);
            }
            else
            {
              // TODO: Not implemented tabs...
              //$('#as1tabs').tabs('disableTab', 'Purchasing');
              $('#bankingtabs').tabs('disableTab', 'Receipts');
              $('#bankingtabs').tabs('disableTab', 'Receipts');
              $('#payrolltabs').tabs('disableTab', 'Process');
              //$('#payrolltabs').tabs('disableTab', 'Timesheets');
              $('#payrolltabs').tabs('disableTab', 'Rosters');

              // Make checking easier later...
              for (var propkey in myperms)
              {
                // We check if this key exists in the obj
                if (myperms.hasOwnProperty(propkey))
                  myperms[propkey] = 1;
              }

              cmdcentre = new Treant([cmdcentreConfig, noderoot, nodesales, nodejobsheets, nodeinventory, nodeaccounts, nodepayroll]);
            }
          }

          doWidgetListeners();
        }
        else
          $('#divEvents').trigger('posready', {pdata: 'none'});
      }
    );

    primus.on
    (
      'changepassword',
      function(data)
      {
        $('#divEvents').trigger('changepassword', {data: data, pdata: $.extend(data.pdata, {})});
      }
    );

    // ************************************************************************************************************************************************************************************************
    // Application responses
    // ************************************************************************************************************************************************************************************************

    // Account requests
    primus.on
    (
      'listaccounts',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_accounts = [];

          data.rs.forEach
          (
            function(a)
            {
              var name = doNiceTitleizeString(a.name);
              var node =
              {
                id: doNiceId(a.id),
                parentid: doNiceId(a.parentid),
                parentname: doNiceTitleizeString(a.parentname),
                code: doNiceString(a.code),
                name: name,
                altcode: doNiceString(a.altcode),
                altname: doNiceTitleizeString(a.altname),
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                type: a.itype,
                date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
                by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated),
                children: []
              };

              if (_.isUN(a.parentid))
                cache_accounts.push(node);
              else
              {
                var parent = doFindParentNode(cache_accounts, a.parentid);
                // Find parent...
                if (!_.isUN(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger('listaccounts', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    function doAddPrimusListenerEmitter(eventname, emitname)
    {
      primus.on
      (
        eventname,
        function(data)
        {
          doServerMessage(emitname, {type: 'refresh'});
        }
      );
    }

    function doAddPrimusListener(eventname, cb)
    {
      primus.on
      (
        eventname,
        function(data)
        {
          if (!_.isUN(cb))
            cb(eventname, data);
          else
            $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      );
    }

    // Account requests
    doAddPrimusListener('loadaccount');
    doAddPrimusListener('newaccount');
    doAddPrimusListener('saveaccount');
    doAddPrimusListener('changeaccountparent');
    doAddPrimusListener('expireaccount');
    doAddPrimusListener('checkaccountcode');

    // Journal requests
    doAddPrimusListener('listjournals');
    doAddPrimusListener('newjournal');
    doAddPrimusListener('testjournal');

    // Exchange rate requests
    primus.on
    (
      'listexchangerates',
      function(data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_exchangerates = [];

          data.rs.forEach
          (
            function(x)
            {
              cache_exchangerates.push
              (
                {
                  id: doNiceId(x.id),
                  provider: doNiceString(x.provider),
                  name: doNiceString(x.name),
                  currency: doNiceString(x.currency),
                  rate: _.formatnumber(x.rate, 4),
                  date: doNiceDateModifiedOrCreated(x.datemodified, x.datecreated),
                  by: doNiceModifiedBy(x.datemodified, x.usermodified, x.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger('listexchangerates', {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    doAddPrimusListener('newexchangerate');
    doAddPrimusListener('saveexchangerate');
    doAddPrimusListener('expireexchangerate');
    doAddPrimusListener('latestrates');

    // Taxcode requests
    doAddPrimusListener('loadtaxcode');
    doAddPrimusListener('newtaxcode');
    doAddPrimusListener('savetaxcode');
    doAddPrimusListener('expiretaxcode');
    doAddPrimusListener('checktaxcode');

    doAddPrimusListener
    (
      'listtaxcodes',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_taxcodes = [];

          data.rs.forEach
          (
            function(t)
            {
              cache_taxcodes.push
              (
                {
                  id: doNiceId(t.id),
                  code: doNiceString(t.code),
                  name: doNiceString(t.name),
                  percent: _.formatnumber(t.percent, 4),
                  date: doNiceDateModifiedOrCreated(t.datemodified, t.datecreated),
                  by: doNiceModifiedBy(t.datemodified, t.usermodified, t.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Location requests
    doAddPrimusListener('loadlocation');
    doAddPrimusListener('newlocation');
    doAddPrimusListener('savelocation');
    doAddPrimusListener('changelocationparent');
    doAddPrimusListener('expirelocation');
    doAddPrimusListener('checklocationcode');

    doAddPrimusListener
    (
      'listlocations',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_locations = [];

          data.rs.forEach
          (
            function(l)
            {
              var name = doNiceString(l.name);
              var node =
              {
                id: doNiceId(l.id),
                parentid: doNiceId(l.parentid),
                parentname: doNiceId(l.parentname),
                code: doNiceString(l.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                address1: doNiceString(l.address1),
                address2: doNiceString(l.address2),
                city: doNiceString(l.city),
                statename: doNiceString(l.state),
                postcode: doNiceString(l.postcode),
                country: _.isBlank(l.country) ? defaultCountry : doNiceString(l.country),
                gpslat: _.formatnumber(l.gpslat, 4),
                gpslon: _.formatnumber(l.gpslon, 4),
                attrib1: doNiceString(l.attrib1),
                attrib2: doNiceString(l.attrib2),
                attrib3: doNiceString(l.attrib3),
                attrib4: doNiceString(l.attrib4),
                attrib5: doNiceString(l.attrib5),
                bay: doNiceString(l.bay),
                level: doNiceString(l.level),
                shelf: doNiceString(l.shelf),
                date: doNiceDateModifiedOrCreated(l.datemodified, l.datecreated),
                by: doNiceModifiedBy(l.datemodified, l.usermodified, l.usercreated),
                children: []
              };

              if (_.isUN(l.parentid))
                cache_locations.push(node);
              else
              {
                var parent = doFindParentNode(cache_locations, l.parentid);
                // Find parent...
                if (!_.isUN(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Client requests
    doAddPrimusListener('loadclient');
    doAddPrimusListener('newclient');
    doAddPrimusListener('saveclient');
    doAddPrimusListener('changeclientparent');
    doAddPrimusListener('expireclient');
    doAddPrimusListener('checkclientcode');
    doAddPrimusListener('listemails');

    doAddPrimusListener
    (
      'listclients',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_clients = [];

          data.rs.forEach
          (
            function(c)
            {
              var name = doNiceString(c.name);
              var node =
              {
                id: doNiceId(c.id),
                parentid: doNiceId(c.parentid),
                parentname: doNiceString(c.parentname),
                code: doNiceString(c.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                isactive: c.isactive,
                issupplier: c.issupplier,
                date: doNiceDateModifiedOrCreated(c.datemodified, c.datecreated),
                by: doNiceModifiedBy(c.datemodified, c.usermodified, c.usercreated),
                children: []
              };

              if (_.isUN(c.parentid))
                cache_clients.push(node);
              else
              {
                var parent = doFindParentNode(cache_clients, c.parentid);
                // Find parent...
                if (!_.isUN(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Client note requests
    doAddPrimusListener('listclientnotes');
    doAddPrimusListener('newclientnote');
    doAddPrimusListener('saveclientnote');
    doAddPrimusListener('expireclientnote');
    doAddPrimusListener('searchclientnote');

    // Client attachment requests
    doAddPrimusListener('listclientattachments');
    doAddPrimusListener('saveclientattachment');
    doAddPrimusListener('expireclientattachment');

    // Supplier requests
    doAddPrimusListener('loadsupplier');
    doAddPrimusListener('newsupplier');
    doAddPrimusListener('savesupplier');
    doAddPrimusListener('changesupplierparent');
    doAddPrimusListener('expiresupplier');
    doAddPrimusListener('checksuppliercode');

    doAddPrimusListener
    (
      'listsuppliers',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_suppliers = [];

          data.rs.forEach
          (
            function(c)
            {
              var name = doNiceString(c.name);
              var node =
              {
                id: doNiceId(c.id),
                parentid: doNiceId(c.parentid),
                parentname: doNiceString(c.parentname),
                code: doNiceString(c.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                isactive: c.isactive,
                isclient: c.isclient,
                date: doNiceDateModifiedOrCreated(c.datemodified, c.datecreated),
                by: doNiceModifiedBy(c.datemodified, c.usermodified, c.usercreated),
                children: []
              };

              if (_.isUN(c.parentid))
                cache_suppliers.push(node);
              else
              {
                var parent = doFindParentNode(cache_suppliers, c.parentid);
                // Find parent...
                if (!_.isUN(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Supplier note requests
    doAddPrimusListener('listsuppliernotes');
    doAddPrimusListener('newsuppliernote');
    doAddPrimusListener('savesuppliernote');

    // Supplier attachment requests
    doAddPrimusListener('listsupplierattachments');
    doAddPrimusListener('savesupplierattachment');
    doAddPrimusListener('expiresupplierattachment');

    // Employee requests
    doAddPrimusListener('loademployee');
    doAddPrimusListener('newemployee');
    doAddPrimusListener('saveemployee');
    doAddPrimusListener('changeemployeeparent');
    doAddPrimusListener('expireemployee');
    doAddPrimusListener('checkemployeecode');

    doAddPrimusListener
    (
      'listemployees',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_employees = [];

          data.rs.forEach
          (
            function(e)
            {
              var node =
              {
                id: doNiceId(e.id),
                parentid: doNiceId(e.parentid),
                code: doNiceString(e.code),
                altcode: doNiceString(e.altcode),
                lastname: doNiceTitleizeString(e.lastname),
                firstname: doNiceTitleizeString(e.firstname),
                // Text property used in combotree.... arghhh inconsistent property names...
                text: doNiceTitleizeString(e.firstname + ' ' + e.lastname),
                email1: doNiceString(e.email1),
                phone1: doNiceString(e.phone1),
                gender: (e.gender == 'F') ? 1 : 0,
                date: doNiceDateModifiedOrCreated(e.datemodified, e.datecreated),
                by: doNiceModifiedBy(e.datemodified, e.usermodified, e.usercreated),
                children: []
              };

              if (_.isUN(e.parentid))
                cache_employees.push(node);
              else
              {
                var parent = doFindParentNode(cache_employees, e.parentid);
                // Find parent...
                if (!_.isUN(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Payroll requests
    doAddPrimusListener
    (
      'listpayrollemployees',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_employees = [];

          data.rs.forEach
          (
            function(e)
            {
              cache_employees.push
              (
                {
                  id: doNiceId(e.id),
                  parentid: doNiceId(e.parentid),
                  code: doNiceString(e.code),
                  name: doNiceString(e.name),
                  employmenttype: _.formatinteger(e.employmenttype),
                  date: doNiceDateModifiedOrCreated(e.datemodified, e.datecreated),
                  by: doNiceModifiedBy(e.datemodified, e.usermodified, e.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // User requests
    doAddPrimusListener('loaduser');
    doAddPrimusListener('newuser');
    doAddPrimusListener('saveuser');
    doAddPrimusListener('expireuser');
    doAddPrimusListener('checkuseruid');
    doAddPrimusListener('changepassword');
    doAddPrimusListener('listconnectedusers');
    doAddPrimusListener('saveuserpermissions');

    doAddPrimusListener
    (
      'listusers',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_users = [];

          data.rs.forEach
          (
            function(u)
            {
              var imgstatus = (u.uuid == uuid) ? mapUserStatusToImage('online') : mapUserStatusToImage('unknown');

              cache_users.push
              (
                {
                  uuid: doNiceString(u.uuid),
                  name: doNiceString(u.uname),
                  username: doNiceString(u.uid),
                  email: doNiceString(u.email),
                  phone: doNiceString(u.phone),
                  isadmin: u.isadmin,
                  isclient: u.isclient,
                  avatar: doNiceString(u.avatar),
                  canvieworders: u.canvieworders,
                  cancreateorders: u.cancreateorders,
                  canviewinvoices: u.canviewinvoices,
                  cancreateinvoices: u.cancreateinvoices,
                  canviewinventory: u.canviewinventory,
                  cancreateinventory: u.cancreateinventory,
                  canviewpayroll: u.canviewpayroll,
                  cancreatepayroll: u.cancreatepayroll,
                  canviewproducts: u.canviewproducts,
                  cancreateproducts: u.cancreateproducts,
                  canviewclients: u.canviewclients,
                  cancreateclients: u.cancreateclients,
                  canviewcodes: u.canviewcodes,
                  cancreatecodes: u.cancreatecodes,
                  canviewusers: u.canviewusers,
                  cancreateusers: u.cancreateusers,
                  canviewbuilds: u.canviewbuilds,
                  cancreatebuilds: u.cancreatebuilds,
                  canviewtemplates: u.canviewtemplates,
                  cancreatetemplates: u.cancreatetemplates,
                  canviewbanking: u.canviewbanking,
                  cancreatebanking: u.cancreatebanking,
                  canviewpurchasing: u.canviewpurchasing,
                  cancreatepurchasing: u.cancreatepurchasing,
                  canviewalerts: u.canviewalerts,
                  cancreatealerts: u.cancreatealerts,
                  canviewdashboard: u.canviewdashboard,
                  cancreatedashboard: u.cancreatedashboard,
                  lastlogin: u.lastlogindate,
                  lastlogout: u.lastlogoutdate,
                  lastip: u.lastloginip,
                  clientid: u.clientid,
                  date: doNiceDateModifiedOrCreated(u.datemodified, u.datecreated),
                  by: doNiceModifiedBy(u.datemodified, u.usermodified, u.usercreated),
                  status: imgstatus
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Superfund requests
    doAddPrimusListener('newsuperfund');
    doAddPrimusListener('savesuperfund');
    doAddPrimusListener('expiresuperfund');
    doAddPrimusListener('checksuperfundname');

    doAddPrimusListener
    (
      'listsuperfunds',
      function(eventname,data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_superfunds = [];

          data.rs.forEach
          (
            function(s)
            {
              cache_superfunds.push
              (
                {
                  id: doNiceId(s.id),
                  name: doNiceString(s.name),
                  date: doNiceDateModifiedOrCreated(s.datemodified, s.datecreated),
                  by: doNiceModifiedBy(s.datemodified, s.usermodified, s.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Invoice requests
    doAddPrimusListener('listinvoices');
    doAddPrimusListener('listunpaidordersbyclient');
    doAddPrimusListener('listunpaidpordersbyclient');
    doAddPrimusListener('payinvoices');
    doAddPrimusListener('paypurchaseorders');

    // print requests
    doAddPrimusListener('emailorder');
    doAddPrimusListener('emailinvoice');
    doAddPrimusListener('searchinvoices');

    doAddPrimusListener
    (
      'printinvoices',
      function(eventname, data)
      {
        if (!_.isUN(data.rs))
        {
          data.rs.forEach
          (
            function(f)
            {
              var url = '/di?no=' + f.invoiceno + '&fguid=' + fguid;
              var w = window.open(url, '_blank');

              if (w)
                w.print();

              doShowSuccess('Invoice [' + f.invoiceno + '] has been downloaded');
            }
          );

          // Get updated display of #copies printed for invoice(s)
          primus.emit('listinvoices', {fguid: fguid, uuid: uuid, session: session, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    doAddPrimusListener
    (
      'printorders',
      function(eventname, data)
      {
        if (!_.isUN(data.rs))
        {
          data.rs.forEach
          (
            function(f)
            {
              var url = '/do?no=' + f.orderno + '&fguid=' + fguid;
              var w = window.open(url, '_blank');

              if (w)
                w.print();
            }
          );
        }
      }
    );

    doAddPrimusListener
    (
      'printdeliverydockets',
      function(eventname, data)
      {
        if (!_.isUN(data.rs))
        {
          data.rs.forEach
          (
            function(f)
            {
              var url = '/do?filename=' + f;
              var w = window.open(url, '_blank');

              if (w)
                w.print();
            }
          );
        }
      }
    );

    doAddPrimusListener
    (
      'printquotes',
      function(eventname, data)
      {
        if (!_.isUN(data.rs))
        {
          data.rs.forEach
          (
            function(f)
            {
              var url = '/do?filename=' + f;
              var w = window.open(url, '_blank');

              if (w)
                w.print();
            }
          );
        }
      }
    );

    // Config requests
    doAddPrimusListener('saveconfig');
    doAddPrimusListener('loademailtemplates');
    doAddPrimusListener('saveemailtemplates');
    doAddPrimusListener('saveprinttemplate');
    doAddPrimusListener('expireprinttemplate');

    doAddPrimusListener
    (
      'loadconfig',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs) && (data.rs.length == 1))
        {
          var cfg = data.rs[0];

          cache_config =
          {
            statusid: cfg.statusid,
            inventoryadjustaccountid: cfg.inventoryadjustaccountid,
            currentquoteno: cfg.currentquoteno,
            currentorderno: cfg.currentorderno,
            currentporderno: cfg.currentporderno,
            currentinvoiceno: cfg.currentinvoiceno,
            currentjournalno: cfg.currentjournalno,
            currentclientno: cfg.currentclientno,
            currentsupplierno: cfg.currentsupplierno,
            currentempno: cfg.currentempno,
            currentjobsheetno: cfg.currentjobsheetno,
            currentbarcodeno: cfg.currentbarcodeno,
            orderasquote: doNiceIntToBool(cfg.orderasquote),
            inventoryusefifo: doNiceIntToBool(cfg.inventoryusefifo),
            defaultinventorylocationid: cfg.defaultinventorylocationid,
            gstpaidaccountid: cfg.gstpaidaccountid,
            gstcollectedaccountid: cfg.gstcollectedaccountid,
            invoiceprinttemplateid: cfg.invoiceprinttemplateid,
            orderprinttemplateid: cfg.orderprinttemplateid,
            quoteprinttemplateid: cfg.quoteprinttemplateid,
            deliverydocketprinttemplateid: cfg.deliverydocketprinttemplateid,
            araccountid: cfg.araccountid,
            apaccountid: cfg.apaccountid,
            productcostofgoodsaccountid: cfg.productcostofgoodsaccountid,
            productincomeaccountid: cfg.productincomeaccountid,
            productassetaccountid: cfg.productassetaccountid,
            productbuytaxcodeid: cfg.productbuytaxcodeid,
            productselltaxcodeid: cfg.productselltaxcodeid,
            fyearstart: cfg.fyearstart,
            fyearend: cfg.fyearend,
            companyname: cfg.companyname,
            address1: cfg.address1,
            address2: cfg.address2,
            address3: cfg.address3,
            address4: cfg.address4,
            city: cfg.city,
            state: cfg.state,
            postcode: cfg.postcode,
            country: cfg.country,
            bankname: cfg.bankname,
            bankbsb: cfg.bankbsb,
            bankaccountno: cfg.bankaccountno,
            bankaccountname: cfg.bankaccountname,
            expressfee: _.sanitiseAsNumeric(cfg.expressfee, 2),
            autosyncbuildtemplates: cfg.autosyncbuildtemplates,
            attrib1name: cfg.attrib1name,
            attrib2name: cfg.attrib2name,
            attrib3name: cfg.attrib3name,
            attrib4name: cfg.attrib4name,
            attrib5name: cfg.attrib5name,
            posclientid: cfg.posclientid,

            date: doNiceDateModifiedOrCreated(cfg.datemodified, cfg.datecreated),
            by: doNiceModifiedBy(cfg.datemodified, cfg.usermodified, cfg.usercreated)
          };

          doCustomAttributeLabelName(1, cache_config.attrib1name);
          doCustomAttributeLabelName(2, cache_config.attrib2name);
          doCustomAttributeLabelName(3, cache_config.attrib3name);
          doCustomAttributeLabelName(4, cache_config.attrib4name);
          doCustomAttributeLabelName(5, cache_config.attrib5name);

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    doAddPrimusListener
    (
      'listprinttemplates',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_printtemplates = [];

          data.rs.forEach
          (
            function(t)
            {
              cache_printtemplates.push
              (
                {
                  id: doNiceId(t.id),
                  name: doNiceString(t.name),
                  description: doNiceString(t.description),
                  mimetype: '<a href="javascript:void(0);" onClick="doThrowPrintTemplate(' + t.id + ');">' + mapMimeTypeToImage(t.mimetype) + '</a>',
                  size: doNiceString(t.size),
                  date: doNiceDateModifiedOrCreated(t.datemodified, t.datecreated),
                  by: doNiceModifiedBy(t.datemodified, t.usermodified, t.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Product category requests
    doAddPrimusListener('loadproductcategory');
    doAddPrimusListener('newproductcategory');
    doAddPrimusListener('saveproductcategory');
    doAddPrimusListener('changeproductcategoryparent');
    doAddPrimusListener('expireproductcategory');
    doAddPrimusListener('checkproductcategorycode');

    doAddPrimusListener
    (
      'listproductcategories',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_productcategories = [];

          data.rs.forEach
          (
            function(p)
            {
              var name = doNiceTitleizeString(p.name);
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceId(p.parentname),
                code: doNiceString(p.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isUN(p.parentid))
                cache_productcategories.push(node);
              else
              {
                var parent = doFindParentNode(cache_productcategories, p.parentid);
                // Find parent...
                if (!_.isUN(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Product requests
    doAddPrimusListener
    (
      'listproducts',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_products = [];

          data.rs.forEach
          (
            function(p)
            {
              cache_products.push
              (
                {
                  id: doNiceId(p.id),
                  productcategoryid: doNiceId(p.productcategoryid),
                  productcategoryname: doNiceString(p.productcategoryname),
                  name: doNiceString(p.name),
                  code: doNiceString(p.code),
                  altcode: doNiceString(p.altcode),
                  barcode: doNiceString(p.barcode),
                  costprice: _.formatnumber(p.costprice, 4),
                  costgst: _.formatnumber(p.costgst, 4),
                  sellprice: _.formatnumber(p.sellprice, 4),
                  sellgst: _.formatnumber(p.sellgst, 4),
                  buytaxcodeid: doNiceId(p.buytaxcodeid),
                  selltaxcodeid: doNiceId(p.selltaxcodeid),
                  costofgoodsaccountid: doNiceId(p.costofgoodsaccountid),
                  incomeaccountid: doNiceId(p.incomeaccountid),
                  assetaccountid: doNiceId(p.assetaccountid),
                  uom: doNiceString(p.uom).toUpperCase(),
                  uomsize: _.formatnumber(p.uomsize, 4),
                  buildtemplateid: doNiceId(p.buildtemplateid),
                  minstock: _.formatnumber(p.minstockqty, 4),
                  stockwarn: _.formatnumber(p.stockqtywarnthreshold, 4),
                  width: _.formatnumber(p.width, 4),
                  length: _.formatnumber(p.length, 4),
                  height: _.formatnumber(p.height, 4),
                  weight: _.formatnumber(p.weight, 4),
                  attrib1: doNiceString(p.attrib1),
                  attrib2: doNiceString(p.attrib2),
                  attrib3: doNiceString(p.attrib3),
                  attrib4: doNiceString(p.attrib4),
                  attrib5: doNiceString(p.attrib5),
                  isactive: p.isactive,
                  clientid: doNiceId(p.clientid),
                  productaliasid: doNiceId(p.productaliasid),
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    doAddPrimusListener
    (
      'listproductsbycategory',
      function(eventname, data)
      {
        if (!_.isUN(data.rs))
        {
          cache_productsbycategory = [];

          data.rs.forEach
          (
            function(p)
            {
              cache_productsbycategory.push
              (
                {
                  id: doNiceId(p.id),
                  productcategoryid: doNiceId(p.productcategoryid),
                  name: doNiceString(p.name),
                  code: doNiceString(p.code),
                  altcode: doNiceString(p.altcode),
                  barcode: doNiceString(p.barcode),
                  costprice: _.formatnumber(p.costprice, 4),
                  costgst: _.formatnumber(p.costgst, 4),
                  sellprice: _.formatnumber(p.sellprice, 4),
                  sellgst: _.formatnumber(p.sellgst, 4),
                  buytaxcodeid: doNiceId(p.buytaxcodeid),
                  selltaxcodeid: doNiceId(p.selltaxcodeid),
                  costofgoodsaccountid: doNiceId(p.costofgoodsaccountid),
                  incomeaccountid: doNiceId(p.incomeaccountid),
                  assetaccountid: doNiceId(p.assetaccountid),
                  uom: doNiceString(p.uom).toUpperCase(),
                  uomsize: _.formatnumber(p.uomsize, 4),
                  buildtemplateid: doNiceId(p.buildtemplateid),
                  minstock: _.formatnumber(p.minstockqty, 4),
                  stockwarn: _.formatnumber(p.stockqtywarnthreshold, 4),
                  width: _.formatnumber(p.width, 4),
                  length: _.formatnumber(p.length, 4),
                  height: _.formatnumber(p.height, 4),
                  weight: _.formatnumber(p.weight, 4),
                  attrib1: doNiceString(p.attrib1),
                  attrib2: doNiceString(p.attrib2),
                  attrib3: doNiceString(p.attrib3),
                  attrib4: doNiceString(p.attrib4),
                  attrib5: doNiceString(p.attrib5),
                  inventoryqty: _.formatnumber(p.inventoryqty, 4),
                  orderqty: _.formatnumber(p.orderqty, 4),
                  isactive: p.isactive,
                  clientid: p.clientid,
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Product requests
    doAddPrimusListener('loadproduct');
    doAddPrimusListener('newproduct');
    doAddPrimusListener('saveproduct');
    doAddPrimusListener('changeproductparent');
    doAddPrimusListener('expireproduct');
    doAddPrimusListener('duplicateproduct');
    doAddPrimusListener('checkproductcode');
    doAddPrimusListener('productsearch');
    doAddPrimusListener('changeproductcategory');

    // Product code requests
    doAddPrimusListener('newproductcode');
    doAddPrimusListener('listproductcodes');
    doAddPrimusListener('expireproductcode');

    // Product pricing requests
    doAddPrimusListener('listproductpricing');
    doAddPrimusListener('productpricingupdated');
    doAddPrimusListener('productpricingupdated');
    doAddPrimusListener('listproductcodes');
    doAddPrimusListener('expireproductpricing');
    doAddPrimusListener('getproductprices');
    doAddPrimusListener('getprice');

    // Build template requests
    doAddPrimusListener('newbuildtemplate');
    doAddPrimusListener('savebuildtemplate');
    doAddPrimusListener('checkbuildtemplatecode');
    doAddPrimusListener('changebuildtemplateparent');
    doAddPrimusListener('loadproductcategory');
    doAddPrimusListener('duplicatebuildtemplate');
    doAddPrimusListener('expirebuildtemplate');
    doAddPrimusListener('syncbuildtemplatestomaster');
    doAddPrimusListener('buildtemplatesearch');

    doAddPrimusListener
    (
      'listbuildtemplates',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_buildtemplates = [];

          data.rs.forEach
          (
            function(p)
            {
              var name = doNiceString(p.name);
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceString(p.parentname),
                producttemplateheaderid: doNiceId(p.producttemplateheaderid),
                numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                totalprice: _.formatnumber(p.totalprice, 4),
                totalgst: _.formatnumber(p.totalgst, 4),
                clientid: doNiceId(p.clientid),
                taxcodeid: doNiceId(p.taxcodeid),
                code: doNiceString(p.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                price: _.formatnumber(p.price, 4),
                gst: _.formatnumber(p.gst, 4),
                qty: _.formatnumber(p.qty, 4),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isUN(p.parentid))
                cache_buildtemplates.push(node);
              else
              {
                var parent = doFindParentNode(cache_buildtemplates, p.parentid);
                // Find parent...
                if (!_.isUN(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    doAddPrimusListener
    (
      'buildtemplategetchildren',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          data.rs.forEach
          (
            function(p)
            {
              var name = doNiceString(p.name);
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceString(p.parentname),
                producttemplateheaderid: doNiceId(p.producttemplateheaderid),
                numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                totalprice: _.formatnumber(p.totalprice, 4),
                totalgst: _.formatnumber(p.totalgst, 4),
                clientid: doNiceId(p.clientid),
                taxcodeid: doNiceId(p.taxcodeid),
                code: doNiceString(p.code),
                name: name,
                // Text property used in combotree.... arghhh inconsistent property names...
                text: name,
                price: _.formatnumber(p.price, 4),
                gst: _.formatnumber(p.gst, 4),
                qty: _.formatnumber(p.qty, 4),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isUN(p.parentid))
                cache_buildtemplates.push(node);
              else
              {
                var parent = doFindParentNode(cache_buildtemplates, p.parentid);
                // Find parent...
                if (!_.isUN(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Build template detail requests
    doAddPrimusListener('listproductsbybuildtemplate');
    doAddPrimusListener('newbuildtemplatedetail');
    doAddPrimusListener('savebuildtemplatedetail');
    doAddPrimusListener('expirebuildtemplatedetail');

    // Product template requests
    doAddPrimusListener('newproducttemplate');
    doAddPrimusListener('saveproducttemplate');
    doAddPrimusListener('changeproducttemplateparent');
    doAddPrimusListener('expireproducttemplate');
    doAddPrimusListener('duplicateproducttemplate');
    doAddPrimusListener('buildproducttemplate');

    doAddPrimusListener
    (
      'listproducttemplates',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_producttemplates = [];

          data.rs.forEach
          (
            function(p)
            {
              var node =
              {
                id: doNiceId(p.id),
                parentid: doNiceId(p.parentid),
                parentname: doNiceString(p.parentname),
                numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                totalprice: _.formatnumber(p.totalprice, 4),
                totalgst: _.formatnumber(p.totalgst, 4),
                clientid: doNiceId(p.clientid),
                taxcodeid: doNiceId(p.taxcodeid),
                name: doNiceString(p.name),
                code: doNiceString(p.code),
                price: _.formatnumber(p.price, 4),
                gst: _.formatnumber(p.gst, 4),
                qty: _.formatnumber(p.qty, 4),
                date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated),
                children: []
              };

              if (_.isUN(p.parentid))
                cache_producttemplates.push(node);
              else
              {
                var parent = doFindParentNode(cache_producttemplates, p.parentid);
                // Find parent...
                if (!_.isUN(parent))
                  parent.children.push(node);
              }
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Product template detail requests
    doAddPrimusListener('listproductsbytemplate');
    doAddPrimusListener('listproductsforbuild');
    doAddPrimusListener('newproducttemplatedetail');
    doAddPrimusListener('saveproducttemplatedetail');
    doAddPrimusListener('expireproducttemplatedetail');
    doAddPrimusListener('syncproducttemplate');

    // Permission template requests
    doAddPrimusListener('newpermissiontemplate');

    doAddPrimusListener
    (
      'listpermissiontemplates',
      function (eventname, data) {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs)) {
          cache_permisstiontemplates = [];

          data.rs.forEach
            (
            function (p) {
              var node =
              {
                id: doNiceId(p.id),
                name: doNiceString(p.name),
                // numproducts: (p.numproducts == 0) ? '' : p.numproducts,
                // date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                // by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
              };

              // if (_.isUN(p.parentid))
              //   cache_producttemplates.push(node);
              // else 
              // {
              //   var parent = doFindParentNode(cache_producttemplates, p.parentid);
              //   // Find parent...
              //   if (!_.isUN(parent))
              //     parent.children.push(node);
              // }
            }
            );

          $('#divEvents').trigger(eventname, { data: data, pdata: $.extend(data.pdata, {}) });
        }
      }
    );






    // Inventory requests
    doAddPrimusListener('liststock');
    doAddPrimusListener('addinventory');
    doAddPrimusListener('buildinventory');
    doAddPrimusListener('saveinventory');
    doAddPrimusListener('transferinventory');

    doAddPrimusListener
    (
      'inventoryjournal',
      function(eventname, data)
      {
        if (!_.isUN(data.rs))
        {
          cache_invstock = [];

          data.rs.forEach
          (
            function(i)
            {
              // Real inventory entries append to list of locations we just populated...
              cache_invstock.push
              (
                {
                  id: i.id,
                  locationid: doNiceId(i.locationid),
                  locationname: doNiceString(i.locationname),
                  productid: doNiceString(i.productid),
                  productcode: doNiceString(i.productcode),
                  productname: doNiceString(i.productname),
                  costprice: _.formatnumber(i.costprice, 4),
                  qty: _.formatnumber(i.qty, 4),
                  type: doGetStringFromIdInObjArray(inventorytypes, i.type),
                  batchno: doNiceString(i.batchno),
                  dateexpiry: doNiceDate(i.dateexpiry),
                  dateproduction: doNiceDate(i.dateproduction),
                  comments: doNiceString(i.comments),
                  created: doNiceDate(i.datecreated),
                  by: doNiceTitleizeString(i.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    doAddPrimusListener
    (
      'getinventoryproducttotals',
      function(evntname, data)
      {
        if (!_.isUN(data.total))
        {
          var selectedproductid = doGetDropDownListValue('fldInventoryProduct');

          if (!_.isUN(selectedproductid) && (data.total.productid == selectedproductid))
            $('#spnInventoryQty').html('<strong>Total</strong> in inventory: ' + _.formatnumber(data.total.qty, 4));
        }
      }
    );

    doAddPrimusListener
    (
      'getinventoryproductlocationtotals',
      function(eventname, data)
      {
        if (!_.isUN(data.rs))
        {
          var loc = '';
          var html = '<table border="0" cellpadding="2" style="color: #888; font-style: italic; font-size: small">';

          data.rs.forEach
          (
            function(t)
            {
              // No assigned location?
              loc = _.isUN(t.locationid) ? '' : t.locationname;
              html += '<tr><td align="left">' + loc + ':</td><td align="right">' + _.formatnumber(t.qty, 4) + '</td></tr>';
            }
          );

          html += '</table>';
          $('#spnInventoryLocationQty').html(html);
        }
      }
    );

    // Build requests
    doAddPrimusListener('listbuilds');
    doAddPrimusListener('expirebuild');
    doAddPrimusListener('listorderbuilds');

    // Status alert requests
    doAddPrimusListener('liststatusalerts');
    doAddPrimusListener('loadstatusalert');
    doAddPrimusListener('newstatusalert');
    doAddPrimusListener('savestatusalert');
    doAddPrimusListener('expirestatusalert');

    // POrder requests
    doAddPrimusListener('loadporder');
    doAddPrimusListener('newporder');
    doAddPrimusListener('saveporder');
    doAddPrimusListener('completeporder');
    doAddPrimusListener
    (
      'listporders',
      function(eventname, data)
      {
        doUpdateInitTasksProgress();

        if (!_.isUN(data.rs))
        {
          cache_porders = [];

          data.rs.forEach
          (
            function(o)
            {
              cache_porders.push
              (
                {
                  id: doNiceId(o.id),
                  clientid: doNiceId(o.clientid),
                  porderno: doNiceString(o.porderno),
                  name: doNiceString(o.name),
                  invoiceno: doNiceString(o.invoiceno),
                  refno: doNiceString(o.refno),
                  totalprice: _.sanitiseAsNumeric(o.totalprice, 4),
                  totalqty: _.sanitiseAsNumeric(o.totalqty, 4),
                  /*
                  shiptoname: doNiceString(o.shiptoname),
                  shiptoaddress1: doNiceString(o.shiptoaddress1),
                  shiptoaddress2: doNiceString(o.shiptoaddress2),
                  shiptocity: doNiceString(o.shiptocity),
                  shiptostate: doNiceString(o.shiptostate),
                  shiptopostcode: doNiceString(o.shiptopostcode),
                  shiptocountry: _.isBlank(o.shiptocountry) ? defaultCountry : doNiceString(o.shiptocountry),
                  invoicetoname: doNiceString(o.invoicetoname),
                  invoicetoaddress1: doNiceString(o.invoicetoaddress1),
                  invoicetoaddress2: doNiceString(o.invoicetoaddress2),
                  invoicetocity: doNiceString(o.invoicetocity),
                  invoicetostate: doNiceString(o.invoicetostate),
                  invoicetopostcode: doNiceString(o.invoicetopostcode),
                  invoicetocountry: _.isBlank(o.shiptocountry) ? defaultCountry : doNiceString(o.invoicetocountry),
                  */
                  inventorycommitted: o.inventorycommitted,
                  completed: doNiceDate(o.datecompleted),
                  completedby: doNiceTitleizeString(o.usercompleted),
                  paid: _.formatnumber(o.paid, 2),
                  balance: _.formatnumber(o.balance, 2),
                  date: doNiceDateModifiedOrCreated(o.datemodified, o.datecreated),
                  by: doNiceModifiedBy(o.datemodified, o.usermodified, o.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // POrder detail requests
    doAddPrimusListener('listporderdetails');

    // Order requests
    doAddPrimusListener('listorders');
    doAddPrimusListener('loadorder');
    doAddPrimusListener('neworder');
    doAddPrimusListener('saveorder');
    doAddPrimusListener('expireorder');
    doAddPrimusListener('checkorderpo');
    doAddPrimusListener('duplicateorder');
    doAddPrimusListener('newversionorder');
    doAddPrimusListener('createinvoicefromorder');

    // Order attachment requests
    doAddPrimusListener('listorderattachments');
    doAddPrimusListener('saveorderattachment');
    doAddPrimusListener('expireorderattachment');
    doAddPrimusListener('getorderthumbnail');

    // Order note requests
    doAddPrimusListener('listordernotes');
    doAddPrimusListener('newordernote');
    doAddPrimusListener('saveordernote');
    doAddPrimusListener('expireordernote');
    doAddPrimusListener('searchordernote');

    // Order status requests
    doAddPrimusListener('listorderstatuses');
    doAddPrimusListener('neworderstatus');

    // Quote requests
    doAddPrimusListener('listquotes');
    doAddPrimusListener('duplicatequote');

    // TPCC requests
    doAddPrimusListener('tpccaddstatus');
    doAddPrimusListener('tpccbuild');
    doAddPrimusListener('tpccorderbuilds');
    doAddPrimusListener('tpccloadjobsheet');
    doAddPrimusListener('tpcclistjobsheetdetails');
    doAddPrimusListener('tpccsavejobsheet');
    doAddPrimusListener('tpccjobsheetimagecreated');
    doAddPrimusListener('tpccjobsheetdetailadded');
    doAddPrimusListener('tpccproductcategoryfrombuildtemplate');
    doAddPrimusListener('tpcccreateproductfrombuildtemplate');

    doAddPrimusListener
    (
      'tpccprintjobsheet',
      function(eventname, data)
      {
        if (!_.isUN(data.jobsheetno))
        {
          var url = '/js?no=' + data.jobsheetno + '&fguid=' + fguid;
          var w = window.open(url, '_blank');

          if (w)
            w.print();
        }
      }
    );

    // Order detail requests
    doAddPrimusListener('neworderdetail');
    doAddPrimusListener('saveorderdetail');
    doAddPrimusListener('expireorderdetail');

    doAddPrimusListener
    (
      'listorderdetails',
      function(eventname, data)
      {
        if (!_.isUN(data.rs))
        {
          cache_orderproducts = [];

          data.rs.forEach
          (
            function(p)
            {
              cache_orderproducts.push
              (
                {
                  id: doNiceId(p.id),
                  productid: doNiceId(p.productid),
                  name: doNiceString(p.productname),
                  price: _.sanitiseAsNumeric(p.price),
                  qty: _.niceformatqty(p.qty),
                  discount: _.niceformatqty(p.discount, 2),
                  expressfee: _.niceformatqty(p.expressfee, 2),
                  taxcodeid: doNiceId(p.taxcodeid),
                  isrepeat: doNiceIntToBool(p.isrepeat),
                  date: doNiceDateModifiedOrCreated(p.datemodified, p.datecreated),
                  by: doNiceModifiedBy(p.datemodified, p.usermodified, p.usercreated)
                }
              );
            }
          );

          $('#divEvents').trigger(eventname, {data: data, pdata: $.extend(data.pdata, {})});
        }
      }
    );

    // Gov requests
    doAddPrimusListener('abnlookup');

    // POS requests
    doAddPrimusListener('posgetproduct');
    doAddPrimusListener('posgenbarcode');
    doAddPrimusListener('poscashsale');
    doAddPrimusListener('poscreditsale');
    doAddPrimusListener('possplitsale');
    doAddPrimusListener('possearchsale');
    doAddPrimusListener('posloadsale');
    doAddPrimusListener('posnewcust');
    doAddPrimusListener('possalestotal');

    // MDM requests
    doAddPrimusListener('lastuserpoll');

    // Message requests
    doAddPrimusListener('listchatsforme');
    doAddPrimusListener('listalertsforme');
    doAddPrimusListener('chatmsg');
    doAddPrimusListener('emailhistory');

    // Report requests
    doAddPrimusListener('report');

    // ************************************************************************************************************************************************************************************************
    // Server notification events... usually a broadcast of results from server requests...
    // ************************************************************************************************************************************************************************************************
    doAddPrimusListener
    (
      'eventerror',
      function(eventname, data)
      {
        showIdle();
        if (!_.isUN(data.rc) && !_.isUN(data.msg))
        {
          switch (parseInt(data.rc))
          {
            case errcode_nodata:
            {
              noty({text: 'No data or no matching data', type: 'information', timeout: 4000});
              break;
            }
            case errcode_notloggedin:
            {
              // Ignore...
              break;
            }
            case errcode_usernotregistered:
            case errcode_invalidlogin:
            {
              noty({text: 'Login failed, please try again', type: 'error', timeout: 4000, force: true, killer: true});
              $('#fldUid').focus();
              break;
            }
            default:
            {
              noty({text: 'Error ' + data.rc + ': ' + data.msg, type: 'error', timeout: 10000});
              break;
            }
          }
        }
      }
    );

    // Account events
    doAddPrimusListenerEmitter('accountcreated', 'listaccounts');
    doAddPrimusListenerEmitter('accountsaved', 'listaccounts');
    doAddPrimusListenerEmitter('accountparentchanged', 'listaccounts');
    doAddPrimusListenerEmitter('accountexpired', 'listaccounts');

    // Journal events
    doAddPrimusListenerEmitter('journaladded', 'listjournals');

    // Product category events
    doAddPrimusListenerEmitter('productcategorycreated', 'listproductcategories');
    doAddPrimusListenerEmitter('productcategorysaved', 'listproductcategories');
    doAddPrimusListenerEmitter('productcategoryparentchanged', 'listproductcategories');
    doAddPrimusListenerEmitter('productcategoryexpired', 'listproductcategories');

    // Superfund events
    doAddPrimusListenerEmitter('superfundcreated', 'listsuperfunds');
    doAddPrimusListenerEmitter('superfundsaved', 'listsuperfunds');
    doAddPrimusListenerEmitter('superfundexpired', 'listsuperfunds');

    // Exchange rate events
    doAddPrimusListenerEmitter('exchangeratecreated', 'listexchangerates');
    doAddPrimusListenerEmitter('exchangeratesaved', 'listexchangerates');
    doAddPrimusListenerEmitter('exchangerateexpired', 'listexchangerates');

    // Taxcode events
    doAddPrimusListenerEmitter('taxcodecreated', 'listtaxcodes');
    doAddPrimusListenerEmitter('taxcodesaved', 'listtaxcodes');
    doAddPrimusListenerEmitter('taxcodeexpired', 'listtaxcodes');

    // Location events
    doAddPrimusListener('locationcreated');
    doAddPrimusListener('locationsaved');
    doAddPrimusListener('locationparentchanged');
    doAddPrimusListener('locationexpired');

    // Client events
    doAddPrimusListener('clientcreated');
    doAddPrimusListener('clientsaved');
    doAddPrimusListener('clientparentchanged');
    doAddPrimusListener('clientexpired');

    // Client note events
    doAddPrimusListener('clientnotecreated');
    doAddPrimusListener('clientnotesaved');
    doAddPrimusListener('clientnoteexpired');

    // Client attachment events
    doAddPrimusListener('clientattachmentcreated');
    doAddPrimusListener('clientattachmentsaved');
    doAddPrimusListener('clientattachmentexpired');

    // Supplier events
    doAddPrimusListener('suppliercreated');
    doAddPrimusListener('suppliersaved');
    doAddPrimusListener('supplierparentchanged');
    doAddPrimusListener('supplierexpired');

    // Supplier note events
    doAddPrimusListener('suppliernotecreated');
    doAddPrimusListener('suppliernotesaved');
    doAddPrimusListener('supplierattachmentcreated');
    doAddPrimusListener('supplierattachmentsaved');
    doAddPrimusListener('supplierattachmentexpired');

    // Employee events
    doAddPrimusListener('employeecreated');
    doAddPrimusListener('employeesaved');
    doAddPrimusListener('employeeexpired');
    doAddPrimusListener('employeeparentchanged');

    // Product events
    doAddPrimusListener('productcreated');
    doAddPrimusListener('productsaved');
    doAddPrimusListener('productparentchanged');
    doAddPrimusListener('productexpired');

    // Product code events
    doAddPrimusListener('productcodecreated');
    doAddPrimusListener('productcodeexpired');

    // Product pricing events
    doAddPrimusListener('productpricingcreated');
    doAddPrimusListener('productpricingsaved');
    doAddPrimusListener('productpricingexpired');

    // Build template events
    doAddPrimusListenerEmitter('buildtemplatecreated', 'listbuildtemplates');
    doAddPrimusListenerEmitter('buildtemplatesaved', 'listbuildtemplates');
    doAddPrimusListenerEmitter('buildtemplateduplicated', 'listbuildtemplates');
    doAddPrimusListenerEmitter('buildtemplateexpired', 'listbuildtemplates');
    doAddPrimusListenerEmitter('buildtemplateparentchanged', 'listbuildtemplates');
    doAddPrimusListenerEmitter('buildtemplatesyncedtomaster', 'listbuildtemplates');

    // Build template detail events
    doAddPrimusListener('buildtemplatedetailcreated');
    doAddPrimusListener('buildtemplatedetailsaved');
    doAddPrimusListener('buildtemplateparentchanged');
    doAddPrimusListener('buildtemplateduplicated');
    doAddPrimusListener('buildtemplatedetailexpired');


    // Permission template events
    doAddPrimusListenerEmitter('permissiontemplatecreated', 'listpermissiontemplates');



    // Product template events
    doAddPrimusListenerEmitter('producttemplatecreated', 'listproducttemplates');
    doAddPrimusListenerEmitter('producttemplatesaved', 'listproducttemplates');
    doAddPrimusListenerEmitter('producttemplateparentchanged', 'listproducttemplates');
    doAddPrimusListenerEmitter('producttemplateexpired', 'listproducttemplates');
    doAddPrimusListenerEmitter('producttemplateduplicated', 'listproducttemplates');

    // Product template detail events
    doAddPrimusListener('producttemplatedetailcreated');
    doAddPrimusListener('producttemplatedetailsaved');
    doAddPrimusListener('producttemplatedetailexpired');
    doAddPrimusListener('producttemplatesynced');

    // Invoice events
    doAddPrimusListener('invoicecreated');
    doAddPrimusListener('invoicespaid');
    doAddPrimusListener('porderspaid');

    // POrder events
    doAddPrimusListener('pordercreated');
    doAddPrimusListener('porderexpired');
    doAddPrimusListener('pordercompleted');

    // Order events
    doAddPrimusListener('ordercreated');
    doAddPrimusListener('ordersaved');
    doAddPrimusListener('orderexpired');
    doAddPrimusListener('orderduplicated');
    doAddPrimusListener('ordernewversion');
    doAddPrimusListener('orderinvoicetosaved');
    doAddPrimusListener('orderpaid');

    // Order status events
    doAddPrimusListener('orderstatuscreated');

    // Alert events
    doAddPrimusListener('orderstatusalert');

    // Order note events
    doAddPrimusListener('ordernotecreated');
    doAddPrimusListener('ordernotesaved');
    doAddPrimusListener('ordernoteexpired');

    // Order attachment events
    doAddPrimusListener('orderattachmentcreated');
    doAddPrimusListener('orderattachmentsaved');
    doAddPrimusListener('orderattachmentexpired');

    // Order detail events
    doAddPrimusListener('orderdetailcreated');
    doAddPrimusListener('orderdetailsaved');
    doAddPrimusListener('orderdetailexpired');

    // Inventory events
    doAddPrimusListener('inventoryadded');
    doAddPrimusListener('inventorybuilt');
    doAddPrimusListener('buildexpired');

    // Status alert events
    doAddPrimusListener('statusalertcreated');
    doAddPrimusListener('statusalertsaved');
    doAddPrimusListener('statusalertexpired');

    // Data events
    doAddPrimusListener
    (
      'accountsimported',
      function(eventname, data)
      {
        doShowSuccess('Imported account file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped);
        doServerMessage('listaccounts', {type: 'refresh'});
      }
    );

    doAddPrimusListener
    (
      'employeesimported',
      function(eventname, data)
      {
        doShowSuccess('Imported employees file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped);
        doServerMessage('listemployees', {type: 'refresh'});
      }
    );

    doAddPrimusListener
    (
      'clientsimported',
      function(eventname, data)
      {
        doShowSuccess('Imported clients file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped);
        doServerMessage('listclients', {type: 'refresh'});
      }
    );

    doAddPrimusListener
    (
      'suppliersimported',
      function(eventname, data)
      {
        doShowSuccess('Imported suppliers file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped);
        doServerMessage('listsuppliers', {type: 'refresh'});
      }
    );

    doAddPrimusListener
    (
      'productsimported',
      function(eventname, data)
      {
        doShowSuccess('Imported products file: ' + data.filename + ', #Inserted: ' + data.numinserted + ', #Updated: ' + data.numupdated + ', #Skipped: ' + data.numskipped);
        doServerMessage('listproducts', {type: 'refresh'});
      }
    );

    // Rfid events...
    doAddPrimusListener('newrtap');
    doAddPrimusListener('insertrtap');
    doAddPrimusListener('rtapinserted');
    doAddPrimusListener('listrtaps');

    // Printing events
    doAddPrimusListener('emailsent');

    // User events
    doAddPrimusListenerEmitter('usercreated', 'listusers');
    doAddPrimusListenerEmitter('usersaved', 'listusers');
    doAddPrimusListenerEmitter('userexpired', 'listusers');
    doAddPrimusListener('userpermissionssaved');

    // TPCC events
    doAddPrimusListener('tpccjobsheetcreated');
    doAddPrimusListener('tpccjobsheetexpired');
    doAddPrimusListener('tpccjobsheetsaved');

    // Config events
    doAddPrimusListener('configsaved');
    doAddPrimusListener('printtemplatecreated');
    doAddPrimusListener('printtemplatesaved');
    doAddPrimusListener('printtemplateexpired');

    // POS events
    doAddPrimusListener('poscustcreated');

    // Message events
    doAddPrimusListener('emailfeedback');
    doAddPrimusListener('newchatmsg');

    // MDM events
    doAddPrimusListener('useronline');
    doAddPrimusListener('useroffline');
    doAddPrimusListener('userlogout');
    doAddPrimusListener('userpolled');
    doAddPrimusListener('userpaused');
    doAddPrimusListener('userweather');
    doAddPrimusListener('newpoll');

    console.log('***** Primus initialised...');
  }

  catch (err)
  {
    console.log('****************** Primus exception: ' + err);
  }
}
