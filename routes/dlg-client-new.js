var selectedClientIdAttachmentId = null;

function doDlgClientNew(parentid, clientid)
{
  var isnew = _.isUndefined(clientid) || _.isNull(clientid);
  var client = {};
  var invoicestates = [];
  var shippingstates = [];
  // For notes editor...
  var editorIndex = null;
  var originalContents = null;
  var editorPanel = null;
  var editorId = null;
  // For attachments
  var attachmentIndex = null;

  // Notes editor methods...
  function doEditorNew()
  {
    doServerDataMessage('newclientnote', {clientid: clientid}, {type: 'refresh'});
  }

  function doEditorClear()
  {
    $('#divNewClientNotesG').datagrid('clearSelections');
  }

  function doEditorEdit()
  {
    doGridGetSelectedRowData
    (
      'divNewClientNotesG',
      function(row, rowIndex)
      {
        if (_.isNull(editorIndex))
        {
          editorIndex = rowIndex;

          editorId = 'divClientNote-id-' + row.id;
          originalContents = $('#' + editorId).html();
          editorPanel = new nicEditor({fullPanel : true, iconsPath : '/js/nicedit/nicEditorIcons.gif'}).panelInstance(editorId, {hasPanel: true});
        }
      }
    );
  }

  function doEditorCancel()
  {
    editorIndex = doGridCancelEdit
    (
      'divNewClientNotesG',
      editorIndex,
      function()
      {
        editorPanel.removeInstance(editorId);

        // Perform manual cancel since editor replaces text directly into DIV...
        $('#' + editorId).html(originalContents);

        originalContents = null;
        editorPanel = null;
      }
    );
  }

  function doEditorSave()
  {
    doGridEndEditGetRow
    (
      'divNewClientNotesG',
      editorIndex,
      function(row)
      {
        var notes = nicEditors.findEditor(editorId).getContent();

        doServerDataMessage('saveclientnote', {clientnoteid: row.id, notes: notes}, {type: 'refresh'});

        editorPanel.removeInstance(editorId);
        originalContents = null;
        editorPanel = null;
        editorIndex = null;
      }
    );
  }

  function doEditorRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divNewClientNotesG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove selected note?',
            function(result)
            {
              if (result)
                doServerDataMessage('expireclientnote', {clientnoteid: row.id}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select a note to remove');
    }
  }

  function doEditorSearch()
  {
    doDlgNoteSearch
    (
      function(text)
      {
        doServerDataMessage('searchclientnote', {clientid: clientid, words: text}, {type: 'refresh'});
      },
      function()
      {
        doServerDataMessage('listclientnotes', {clientid: clientid}, {type: 'refresh'});
      }
    );
  }

  function doEditorSaved(ev, args)
  {
    if (clientid == args.data.clientid)
      doServerDataMessage('listclientnotes', {clientid: clientid}, {clientnoteid: args.data.clientnoteid, type: 'refresh'});
  }

  function doEditorLoad(ev, args)
  {
    var data = [];

    args.data.rs.forEach
    (
      function(n)
      {
        data.push
        (
          {
            id: doNiceId(n.id),
            notes: doNiceString(n.notes),
            date: doNiceDateModifiedOrCreated(n.datemodified, n.datecreated),
            by: doNiceModifiedBy(n.datemodified, n.usermodified, n.usercreated)
          }
        );
      }
    );

    $('#divNewClientNotesG').datagrid('loadData', data);

    if (!_.isUndefined(args.pdata.clientnoteid) && !_.isNull(args.pdata.clientnoteid))
      $('#divNewClientNotesG').datagrid('selectRecord', args.pdata.clientnoteid);
  }

  function doEditorSearchNotes(ev, args)
  {
    args.data.rs.forEach
    (
      function(n)
      {
        $('#divNewClientNotesG').datagrid('selectRecord', n.id);
      }
    );
  }

  // Attachments methods
  function doAttachmentClear()
  {
    $('#divNewClientAttachmentsG').datagrid('clearSelections');
  }

  function doAttachmentEdit()
  {
    doGridStartEdit
    (
      'divNewClientAttachmentsG',
      attachmentIndex,
      function(row, index)
      {
        attachmentIndex = index;

        doGridGetEditor
        (
          'divNewClientAttachmentsG',
          attachmentIndex,
          'description',
          function(ed)
          {
          }
        );
      }
    );
  }

  function doAttachmentCancel()
  {
    attachmentIndex = doGridCancelEdit('divNewClientAttachmentsG', attachmentIndex);
  }

  function doAttachmentSave()
  {
    doGridEndEditGetRow
    (
      'divNewClientAttachmentsG',
      attachmentIndex,
      function(row)
      {
        doServerDataMessage('saveclientattachment', {clientattachmentid: row.id, description: row.description, isthumbnail: row.isthumbnail}, {type: 'refresh'});
      }
    );

    attachmentIndex = null;
  }

  function doAttachmentRemove()
  {
    if (!doGridGetSelectedRowData
      (
        'divNewClientAttachmentsG',
        function(row)
        {
          doPromptOkCancel
          (
            'Remove attachment ' + row.description + '?',
            function(result)
            {
              if (result)
                doServerDataMessage('expireclientattachment', {clientattachmentid: row.id}, {type: 'refresh'});
            }
          );
        }
      ))
    {
      doShowError('Please select an attachment to remove');
    }
  }

  function doAttachmentDownload()
  {
    doGridGetSelectedRowData
    (
      'divNewClientAttachmentsG',
      function(row)
      {
        doThrowClientAttachment(row.id);
      }
    );
  }

  function doAttachmentSaved(ev, args)
  {
    if (clientid == args.data.clientid)
      doServerDataMessage('listclientattachments', {clientid: clientid}, {type: 'refresh'});
  }

  function doAttachmentList(ev, args)
  {
    var data = [];

    args.data.rs.forEach
    (
      function(a)
      {
        data.push
        (
          {
            id: doNiceId(a.id),
            name: doNiceString(a.name),
            description: doNiceString(a.description),
            mimetype: '<a href="javascript:void(0);" onClick="doThrowClientAttachment(' + a.id + ');">' + mapMimeTypeToImage(a.mimetype) + '</a>',
            size: doNiceString(a.size),
            isthumbnail: a.isthumbnail,
            image: '<image src="' + a.image + '" width="35px">',
            date: doNiceDateModifiedOrCreated(a.datemodified, a.datecreated),
            by: doNiceModifiedBy(a.datemodified, a.usermodified, a.usercreated)
          }
        );
      }
    );

    $('#divNewClientAttachmentsG').datagrid('loadData', data);
  }

  function doReset()
  {
    $('#cbNewClientParent').combotree('setValue', parentid);

    if (isnew)
    {
      $('#fldNewClientName').textbox('clear');
      $('#fldNewClientCode').textbox('clear');
      $('#fldNewClientContact1').textbox('clear');
      $('#fldNewClientContact2').textbox('clear');
      $('#fldNewClientContact3').textbox('clear');
      $('#fldNewClientContact4').textbox('clear');

      $('#fldNewClientEmail1').textbox('clear');
      $('#fldNewClientUrl1').textbox('clear');

      $('#fldNewClientMobile3').textbox('clear');
      $('#fldNewClientMobile4').textbox('clear');

      $('#fldNewClientPhone1').textbox('clear');
      $('#fldNewClientPhone2').textbox('clear');
      $('#fldNewClientPhone3').textbox('clear');

      $('#fldNewClientFax3').textbox('clear');

      $('#fldNewClientAddress1').textbox('clear');
      $('#fldNewClientAddress2').textbox('clear');
      $('#fldNewClientAddress3').textbox('clear');
      $('#fldNewClientAddress4').textbox('clear');
      $('#fldNewClientCity').textbox('clear');
      $('#fldNewClientPostcode').textbox('clear');
      $('#cbNewClientCountry').combobox('clear');
      $('#cbNewClientState').combobox('clear');

      $('#fldNewClientShippingAddress1').textbox('clear');
      $('#fldNewClientShippingAddress2').textbox('clear');
      $('#fldNewClientShippingAddress3').textbox('clear');
      $('#fldNewClientShippingAddress4').textbox('clear');
      $('#fldNewClientShippingCity').textbox('clear');
      $('#fldNewClientShippingPostcode').textbox('clear');
      $('#cbNewClientShippingCountry').combobox('clear');
      $('#cbNewClientShippingState').combobox('clear');

      $('#fldNewClientBankName').textbox('clear');
      $('#fldNewClientBankBsb').textbox('clear');
      $('#fldNewClientBankAcctNo').textbox('clear');
      $('#fldNewClientBankAcctName').textbox('clear');

      $('#fldNewClientDaysCredit').numberbox('clear');
      $('#fldNewClientLineLimit').numberbox('clear');
      $('#fldNewClientOrderLimit').numberbox('clear');
      $('#fldNewClientCreditLimit').numberbox('clear');

      $('#cbNewClientOrderTemplate').combobox('clear');
      $('#cbNewClientQuoteTemplate').combobox('clear');
      $('#cbNewClientInvoiceTemplate').combobox('clear');
      $('#cbNewClientLabelTemplate').combobox('clear');

      $('#fldNewClientAcn').textbox('clear');
      $('#fldNewClientAbn').textbox('clear');
      $('#fldNewClientHsCode').textbox('clear');
      $('#fldNewClientCustom1').textbox('clear');
      $('#fldNewClientCustom2').textbox('clear');

      $('#btnClientNewAdd').linkbutton('disable');

      $('#cbNewClientCountry').combobox('setValue', defaultCountry);
      $('#cbNewClientShippingCountry').combobox('setValue', defaultCountry);
    }
    else
    {
      if (!_.isEmpty(client))
      {
        $('#fldNewClientName').textbox('initValue', client.name);
        $('#fldNewClientCode').textbox('setValue', client.code);

        $('#fldNewClientContact1').textbox('setValue', client.contact1);
        $('#fldNewClientContact2').textbox('setValue', client.contact2);
        $('#fldNewClientContact3').textbox('setValue', client.contact3);
        $('#fldNewClientContact4').textbox('setValue', client.contact4);

        $('#fldNewClientEmail1').textbox('setValue', client.email1);
        $('#fldNewClientUrl1').textbox('setValue', client.url1);

        $('#fldNewClientMobile3').textbox('setValue', client.mobile3);
        $('#fldNewClientMobile4').textbox('setValue', client.mobile4);

        $('#fldNewClientPhone1').textbox('setValue', client.phone1);
        $('#fldNewClientPhone2').textbox('setValue', client.phone2);
        $('#fldNewClientPhone3').textbox('setValue', client.phone3);

        $('#fldNewClientFax3').textbox('setValue', client.fax3);

        $('#fldNewClientAddress1').textbox('setValue', client.address1);
        $('#fldNewClientAddress2').textbox('setValue', client.address2);
        $('#fldNewClientAddress3').textbox('setValue', client.address3);
        $('#fldNewClientAddress4').textbox('setValue', client.address4);
        $('#fldNewClientCity').textbox('setValue', client.city);
        $('#fldNewClientPostcode').textbox('setValue', client.postcode);
        $('#cbNewClientCountry').combobox('setValue', client.country);
        $('#cbNewClientState').combobox('setValue', client.state);

        $('#fldNewClientShippingAddress1').textbox('setValue', client.shipaddress1);
        $('#fldNewClientShippingAddress2').textbox('setValue', client.shipaddress2);
        $('#fldNewClientShippingAddress3').textbox('setValue', client.shipaddress3);
        $('#fldNewClientShippingAddress4').textbox('setValue', client.shipaddress4);
        $('#fldNewClientShippingCity').textbox('setValue', client.shipcity);
        $('#fldNewClientShippingPostcode').textbox('setValue', client.shippostcode);
        $('#cbNewClientShippingCountry').combobox('setValue', client.shipcountry);
        $('#cbNewClientShippingState').combobox('setValue', client.shipstate);

        $('#fldNewClientBankName').textbox('setValue', client.bankname);
        $('#fldNewClientBankBsb').textbox('setValue', client.bankbsb);
        $('#fldNewClientBankAcctNo').textbox('setValue', client.bankaccountno);
        $('#fldNewClientBankAcctName').textbox('setValue', client.banlaccountname);

        $('#fldNewClientDaysCredit').numberbox('setValue', client.dayscredit);
        $('#fldNewClientLineLimit').numberbox('setValue', client.linelimit);
        $('#fldNewClientOrderLimit').numberbox('setValue', client.orderlimit);
        $('#fldNewClientCreditLimit').numberbox('setValue', client.creditlimit);

        $('#cbNewClientOrderTemplate').combobox('setValue', client.ordertemplateid);
        $('#cbNewClientQuoteTemplate').combobox('setValue', client.quotetemplateid);
        $('#cbNewClientInvoiceTemplate').combobox('setValue', client.invoicetemplateid);
        $('#cbNewClientLabelTemplate').combobox('setValue', client.labeltemplateid);

        $('#fldNewClientAcn').textbox('setValue', client.acn);
        $('#fldNewClientAbn').textbox('setValue', client.abn);
        $('#fldNewClientHsCode').textbox('setValue', client.hscode);
        $('#fldNewClientCustom1').textbox('setValue', client.custcode1);
        $('#fldNewClientCustom2').textbox('setValue', client.custcode2);

        doSetSwitchButton('cbNewClientIsActive', client.isactive);

        $('#btnClientNewAdd').linkbutton('enable');
        $('#dlgClientNew').dialog('setTitle', 'Modify ' + client.name);
      }
    }

    doTextboxFocus('fldNewClientName');
  }

  function doCheckCode(ev, args)
  {
    // Code already exists?
    if (args.data.rs.length > 0)
      $('#btnClientNewAdd').linkbutton('disable');
    else
      $('#btnClientNewAdd').linkbutton('enable');
  }

  function doCientSaved(ev, args)
  {
    $('#dlgClientNew').dialog('close');
  }

  function doLoad(ev, args)
  {
    client = (args.data.client);
    doReset();
  }

  function doABNResults(ev, args)
  {
    if (!_.isUndefined(args.data.rs.Names))
      doDlgPickABN(args.data.rs.Names);
  }

  function doABNSelected(ev, args)
  {
      // Make sure we don't trigger onChange....
      $('#fldNewClientName').textbox('initValue', args.name);
      $('#fldNewClientAbn').textbox('setValue', args.abn);
  }

  function doEditorEventsHandler(ev, args)
  {
    if (args == 'new')
      doEditorNew();
    else if (args == 'clear')
      doEditorClear();
    else if (args == 'edit')
      doEditorEdit();
    else if (args == 'cancel')
      doEditorCancel();
    else if (args == 'save')
      doEditorSave();
      else if (args == 'remove')
      doEditorRemove();
    else if (args == 'search')
      doEditorSearch();
  }

  function doAttachmentEventsHandler(ev, args)
  {
    if (args == 'clear')
      doAttachmentClear();
    else if (args == 'edit')
      doAttachmentEdit();
    else if (args == 'cancel')
      doAttachmentCancel();
    else if (args == 'save')
      doAttachmentSave();
    else if (args == 'remove')
      doAttachmentRemove();
    else if (args == 'download')
      doAttachmentDownload();
  }

  $('#divEvents').on('newclientnote', doEditorSaved);
  $('#divEvents').on('saveclientnote', doEditorSaved);
  $('#divEvents').on('expireclientnote', doEditorSaved);
  $('#divEvents').on('clientnotecreated', doEditorSaved);
  $('#divEvents').on('clientnotesaved', doEditorSaved);
  $('#divEvents').on('clientnoteexpired', doEditorSaved);
  $('#divEvents').on('listclientnotes', doEditorLoad);
  $('#divEvents').on('searchclientnote', doEditorSearchNotes);

  $('#divEvents').on('listclientattachments', doAttachmentList);
  $('#divEvents').on('clientattachmentcreated', doAttachmentSaved);
  $('#divEvents').on('clientattachmentsaved', doAttachmentSaved);
  $('#divEvents').on('clientattachmentexpired', doAttachmentSaved);
  $('#divEvents').on('saveclientattachment', doAttachmentSaved);
  $('#divEvents').on('expireclientattachment', doAttachmentSaved);

  $('#divEvents').on('checkclientcode', doCheckCode);
  $('#divEvents').on('newclient', doCientSaved);
  $('#divEvents').on('saveclient', doCientSaved);
  $('#divEvents').on('loadclient', doLoad);

  $('#divEvents').on('abnlookup', doABNResults);
  $('#divEvents').on('abnselected', doABNSelected);

  $('#divEvents').on('clientnotespopup', doEditorEventsHandler);
  $('#divEvents').on('clientattachmentspopup', doAttachmentEventsHandler);

  $('#dlgClientNew').dialog
  (
    {
      onClose: function()
      {
        $('#divEvents').off('newclientnote', doEditorSaved);
        $('#divEvents').off('saveclientnote', doEditorSaved);
        $('#divEvents').off('clientnotecreated', doEditorSaved);
        $('#divEvents').off('clientnotesaved', doEditorSaved);
        $('#divEvents').off('listclientnotes', doLoad);
        $('#divEvents').off('searchclientnote', doEditorSearchNotes);

        $('#divEvents').off('listorderattachments', doAttachmentList);
        $('#divEvents').off('orderattachmentcreated', doAttachmentSaved);
        $('#divEvents').off('orderattachmentsaved', doAttachmentSaved);
        $('#divEvents').off('orderattachmentexpired', doAttachmentSaved);
        $('#divEvents').off('saveorderattachment', doAttachmentSaved);
        $('#divEvents').off('expireorderattachment', doAttachmentSaved);

        $('#divEvents').off('checkclientcode', doCheckCode);
        $('#divEvents').off('newclient', doCientSaved);
        $('#divEvents').off('saveclient', doCientSaved);
        $('#divEvents').off('loadclient', doLoad);

        $('#divEvents').off('abnlookup', doABNResults);
        $('#divEvents').off('abnselected', doABNSelected);

        $('#divEvents').off('clientnotespopup', doEditorEventsHandler);
        $('#divEvents').off('clientattachmentspopup', doAttachmentEventsHandler);

        // Reset to first TAB and remove notes...
        // Do this here instead of doReset() otherwise get screen "flash" as redraw occurs...
        $('#newclienttabs').tabs('select', 0);
        $('#divNewClientNotesG').datagrid('loadData', []);
      },
      onOpen: function()
      {
        selectedClientIdAttachmentId = clientid;

        $('#cbNewClientParent').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            data: cache_clients
          }
        );

        $('#fldNewClientName').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                doServerDataMessage('abnlookup', {name: newValue}, {type: 'refresh'});
                $('#btnClientNewAdd').linkbutton('enable');
              }
              else
                $('#btnClientNewAdd').linkbutton('disable');
            }
          }
        );

        $('#fldNewClientCode').textbox
        (
          {
            onChange: function(newValue, oldValue)
            {
              if (!_.isBlank(newValue))
              {
                // Check we're using a unique code...
                if (newValue != oldValue)
                  doServerDataMessage('checkclientcode', {clientid: clientid, code: newValue}, {type: 'refresh'});
              }
            }
          }
        );

        $('#cbNewClientPriceLevel').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            limitToList: true,
            data: pricelevels
          }
        );

        $('#cbNewClientIsActive').switchbutton
        (
          {
            checked: true,
            onText: 'Yes',
            offText: 'No'
          }
        );

        $('#cbNewClientCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            limitToList: true,
            data: cache_countries,
            onSelect: function(record)
            {
              invoicestates = doGetStatesFromCountry(record.country);

              $('#cbNewClientState').combobox('loadData', invoicestates);
            }
          }
        );

        $('#cbNewClientShippingCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            limitToList: true,
            data: cache_countries,
            onSelect: function(record)
            {
              shippingstates = doGetStatesFromCountry(record.country);

              $('#cbNewClientShippingState').combobox('loadData', shippingstates);
            }
          }
        );

        $('#cbNewClientState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            limitToList: true,
            data: invoicestates
          }
        );

        $('#cbNewClientShippingState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            limitToList: true,
            data: shippingstates
          }
        );

        $('#cbNewClientOrderTemplate').combobox
        (
          {
            valueField: 'id',
            textField: 'description',
            limitToList: true,
            data: cache_printtemplates
          }
        );

        $('#cbNewClientQuoteTemplate').combobox
        (
          {
            valueField: 'id',
            textField: 'description',
            limitToList: true,
            data: cache_printtemplates
          }
        );

        $('#cbNewClientInvoiceTemplate').combobox
        (
          {
            valueField: 'id',
            textField: 'description',
            limitToList: true,
            data: cache_printtemplates
          }
        );

        $('#cbNewClientLabelTemplate').combobox
        (
          {
            valueField: 'id',
            textField: 'description',
            limitToList: true,
            data: cache_printtemplates
          }
        );

        $('#divNewClientNotesG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: false,
            toolbar: '#tbClientNotes',
            view: $.extend
            (
              {},
              $.fn.datagrid.defaults.view,
              {
                renderRow: function(target, fields, frozen, rowIndex, rowData)
                {
                  var cc = [];

                  if (!frozen && rowData.id)
                  {
                    cc.push
                    (
                      '<td style="width: 950px;; padding: 5px 5px; border: 0;">' +
                      '  <div style="float: left; margin-left: 10px;">' +
                      '    <p><span class="c-label">Modified: ' + '</span>' + rowData.date + '</p>' +
                      '    <p><span class="c-label">By: ' + '</span>' + rowData.by + '</p>' +
                      '  </div>' +
                      '  <div style="clear: both;"></div>' +
                      '  <div id="divClientNote-id-' + rowData.id + '" style="float: left; margin-left: 10px; margin-right: 10px; width: 100%; height: 100px; border: 1px dashed #ddd">' + rowData.notes + '</div> ' +
                      '</td>'
                    );
                  }
                  else
                    cc.push('<td style="width: 100%; padding: 5px 5px; border: 0;"></td>');

                  return cc.join('');
                }
              }
            ),
            onDblClickRow: function(index, row)
            {
              if (_.isNull(editorIndex))
              {
                if (row)
                {
                  editorIndex = index;

                  editorId = 'divClientNote-id-' + row.id;
                  originalContents = $('#' + editorId).html();
                  editorPanel = new nicEditor({fullPanel : true, iconsPath : '/js/nicedit/nicEditorIcons.gif'}).panelInstance(editorId, {hasPanel: true});
                }
              }
            }
          }
        );

        $('#divNewClientAttachmentsG').datagrid
        (
          {
            idField: 'id',
            fitColumns: true,
            singleSelect: true,
            rownumbers: false,
            striped: true,
            toolbar: '#tbClientAttachments',
            columns:
            [
              [
                {title: 'Name',        field: 'name',        width: 200, align: 'left',   resizable: true},
                {title: 'Description', field: 'description', width: 300, align: 'left',   resizable: true, editor: 'text'},
                {title: 'Type',        field: 'mimetype',    width: 100, align: 'center', resizable: true},
                {title: 'Size',        field: 'size',        width: 150, align: 'right',  resizable: true, formatter: function(value, row) {return filesize(value, {base: 10});}},
                {title: 'Modified',    field: 'date',        width: 150, align: 'right',  resizable: true},
                {title: 'By',          field: 'by',          width: 200, align: 'left',   resizable: true}
              ]
            ],
            onRowContextMenu: function(e, index, row)
            {
              doGridContextMenu('divNewClientAttachmentsG', 'divClientAttachmentsMenuPopup', e, index, row);
            },
            onDblClickCell: function(index, field, value)
            {
              doGridStartEdit
              (
                'divNewClientAttachmentsG',
                attachmentIndex,
                function(row, index)
                {
                  attachmentIndex = index;

                  doGridGetEditor
                  (
                    'divNewClientAttachmentsG',
                    attachmentIndex,
                    'description',
                    function(ed)
                    {
                    }
                  );
                }
              );
            }
          }
        );

        if (isnew)
          $('#btnClientNewAdd').linkbutton({text: 'Add'});
        else
          $('#btnClientNewAdd').linkbutton({text: 'Save'});

        if (!_.isUndefined(clientid) && !_.isNull(clientid))
        {
          doServerDataMessage('loadclient', {clientid: clientid}, {type: 'refresh'});
          doServerDataMessage('listclientattachments', {clientid: clientid}, {type: 'refresh'});
          doServerDataMessage('listclientnotes', {clientid: clientid}, {type: 'refresh'});
        }
        else
          doReset();

        $('#newclienttabs').tabs
        (
          {
            selected: 0
          }
        );        
      },
      buttons:
      [
        {
          text: 'Add',
          id: 'btnClientNewAdd',
          handler: function()
          {
            var parentid = doGetComboTreeSelectedId('cbNewClientParent');
            var name = $('#fldNewClientName').textbox('getValue');
            var code = $('#fldNewClientCode').textbox('getValue');

            var email1 = $('#fldNewClientEmail1').textbox('getValue');
            var url1 = $('#fldNewClientUrl1').textbox('getValue');

            var mobile3 = $('#fldNewClientMobile3').textbox('getValue');
            var mobile4 = $('#fldNewClientMobile4').textbox('getValue');

            var phone1 = $('#fldNewClientPhone1').textbox('getValue');
            var phone2 = $('#fldNewClientPhone2').textbox('getValue');
            var phone3 = $('#fldNewClientPhone3').textbox('getValue');

            var fax3 = $('#fldNewClientFax3').textbox('getValue');

            var contact1 = $('#fldNewClientContact1').textbox('getValue');
            var contact2 = $('#fldNewClientContact2').textbox('getValue');
            var contact3 = $('#fldNewClientContact3').textbox('getValue');
            var contact4 = $('#fldNewClientContact4').textbox('getValue');

            var bankname = $('#fldNewClientBankName').textbox('getValue');
            var bankbsb = $('#fldNewClientBankBsb').textbox('getValue');
            var bankacctno = $('#fldNewClientBankAcctNo').textbox('getValue');
            var bankacctname = $('#fldNewClientBankAcctName').textbox('getValue');

            var address1 = $('#fldNewClientAddress1').textbox('getValue');
            var address2 = $('#fldNewClientAddress2').textbox('getValue');
            var address3 = $('#fldNewClientAddress3').textbox('getValue');
            var address4 = $('#fldNewClientAddress4').textbox('getValue');
            var city = $('#fldNewClientCity').textbox('getValue');
            var postcode = $('#fldNewClientPostcode').textbox('getValue');
            var country = $('#cbNewClientCountry').combobox('getValue');
            var state = $('#cbNewClientState').combobox('getValue');

            var shiptoaddress1 = $('#fldNewClientShippingAddress1').textbox('getValue');
            var shiptoaddress2 = $('#fldNewClientShippingAddress2').textbox('getValue');
            var shiptoaddress3 = $('#fldNewClientShippingAddress3').textbox('getValue');
            var shiptoaddress4 = $('#fldNewClientShippingAddress4').textbox('getValue');
            var shiptocity = $('#fldNewClientShippingCity').textbox('getValue');
            var shiptopostcode = $('#fldNewClientShippingPostcode').textbox('getValue');
            var shiptocountry = $('#cbNewClientShippingCountry').combobox('getValue');
            var shiptostate = $('#cbNewClientShippingState').combobox('getValue');

            var dayscredit = $('#fldNewClientDaysCredit').numberbox('getValue');
            var linelimit = $('#fldNewClientLineLimit').numberbox('getValue');
            var orderlimit = $('#fldNewClientOrderLimit').numberbox('getValue');
            var creditlimit = $('#fldNewClientCreditLimit').numberbox('getValue');

            var ordertemplateid = $('#cbNewClientOrderTemplate').combobox('getValue');
            var qoutetemplateid = $('#cbNewClientQuoteTemplate').combobox('getValue');
            var invoicetemplateid = $('#cbNewClientInvoiceTemplate').combobox('getValue');
            var labeltemplateid = $('#cbNewClientLabelTemplate').combobox('getValue');

            var acn = $('#fldNewClientAcn').textbox('getValue');
            var abn = $('#fldNewClientAbn').textbox('getValue');
            var hscode = $('#fldNewClientHsCode').textbox('getValue');
            var custcode1 = $('#fldNewClientCustom1').textbox('getValue');
            var custcode2 = $('#fldNewClientCustom2').textbox('getValue');

            var isactive = doSwitchButtonChecked('cbNewClientIsActive');

            if (!_.isBlank(name))
            {
              if (isnew)
              {
                doServerDataMessage
                (
                  'newclient',
                  {
                    parentid: parentid,
                    name: name,
                    code: code,
                    email1: email1,
                    url1: url1,

                    mobile3: mobile3,
                    mobile4: mobile4,

                    phone1: phone1,
                    phone2: phone2,
                    phone3: phone3,

                    fax3: fax3,

                    contact1: contact1,
                    contact2: contact2,
                    contact3: contact3,
                    contact4: contact4,

                    address1: address1,
                    address2: address2,
                    address3: address3,
                    address4: address4,
                    city: city,
                    state: state,
                    postcode: postcode,
                    country: country,

                    shiptoaddress1: shiptoaddress1,
                    shiptoaddress2: shiptoaddress2,
                    shiptoaddress3: shiptoaddress3,
                    shiptoaddress4: shiptoaddress4,
                    shiptocity: shiptocity,
                    shiptostate: shiptostate,
                    shiptopostcode: shiptopostcode,
                    shiptocountry: shiptocountry,

                    bankname: bankname,
                    bankbsb: bankbsb,
                    bankaccountno: bankacctno,
                    bankaccountname: bankacctname,

                    dayscredit: dayscredit,
                    linelimit: linelimit,
                    orderlimit: orderlimit,
                    creditlimit: creditlimit,

                    invoicetemplateid: invoicetemplateid,
                    ordertemplateid: ordertemplateid,
                    qoutetemplateid: qoutetemplateid,
                    labeltemplateid: labeltemplateid,

                    isactive: isactive,
                    issupplier: false,
                    isclient: true,

                    acn: acn,
                    abn: abn,
                    hscode: hscode,
                    custcode1: custcode1,
                    custcode2: custcode2
                  },
                  {type: 'refresh'}
                );
              }
              else
              {
                doEditorSave();
                doServerDataMessage
                (
                  'saveclient',
                  {
                    clientid: clientid,
                    parentid: parentid,
                    name: name,
                    code: code,
                    email1: email1,
                    url1: url1,

                    mobile3: mobile3,
                    mobile4: mobile4,

                    phone1: phone1,
                    phone2: phone2,
                    phone3: phone3,

                    fax3: fax3,

                    contact1: contact1,
                    contact2: contact2,
                    contact3: contact3,
                    contact4: contact4,

                    address1: address1,
                    address2: address2,
                    address3: address3,
                    address4: address4,
                    city: city,
                    state: state,
                    postcode: postcode,
                    country: country,

                    shiptoaddress1: shiptoaddress1,
                    shiptoaddress2: shiptoaddress2,
                    shiptoaddress3: shiptoaddress3,
                    shiptoaddress4: shiptoaddress4,
                    shiptocity: shiptocity,
                    shiptostate: shiptostate,
                    shiptopostcode: shiptopostcode,
                    shiptocountry: shiptocountry,

                    bankname: bankname,
                    bankbsb: bankbsb,
                    bankaccountno: bankacctno,
                    bankaccountname: bankacctname,

                    dayscredit: dayscredit,
                    linelimit: linelimit,
                    orderlimit: orderlimit,
                    creditlimit: creditlimit,

                    invoicetemplateid: invoicetemplateid,
                    ordertemplateid: ordertemplateid,
                    qoutetemplateid: qoutetemplateid,
                    labeltemplateid: labeltemplateid,

                    isactive: isactive,
                    issupplier: false,
                    isclient: true,

                    acn: acn,
                    abn: abn,
                    hscode: hscode,
                    custcode1: custcode1,
                    custcode2: custcode2
                  },
                  {type: 'refresh'}
                );
              }
            }
            else
              doMandatoryTextbox('Please enter an client name', 'fldNewClientName');
          }
        },
        {
          text: 'Reset',
          handler: function()
          {
            doReset();
          }
        },
        {
          text: 'Close',
          handler: function()
          {
            $('#dlgClientNew').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
