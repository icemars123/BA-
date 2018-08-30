function doDlgQuoteSearch()
{
  var states = [];

  function doReset()
  {
    $('#fldSearchQuoteNo').textbox('clear');
    $('#fldSearchQuotePONo').textbox('clear');
    $('#fldSearchQuoteName').textbox('clear');
    $('#fldSearchQuoteVersion').textbox('clear');
    $('#cbSearchQuoteClients').combotree('clear');

    $('#fldSearchQuoteShipPostcode').textbox('clear');
    $('#fldSearchQuoteShipCity').textbox('clear');
    $('#cbSearchQuoteShipCountry').combobox('clear');
    $('#cbSearchQuoteShipState').combobox('clear');

    $('#cbSearchQuoteStatus').combobox('clear');

    $('#dtSearchQuoteDateStart').datebox('clear');
    $('#dtSearchQuoteDateEnd').datebox('clear');

    doServerMessage('listquotes', {type: 'refresh'});
  }

  $('#dlgQuoteSearch').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
        $('#cbSearchQuoteClients').combotree
        (
          {
            valueField: 'id',
            textField: 'name',
            multiple: true,
            data: cache_clients
          }
        );

        $('#cbSearchQuoteShipCountry').combobox
        (
          {
            valueField: 'country',
            textField: 'country',
            limitToList: true,
            data: cache_countries,
            onSelect: function(record)
            {
              states = doGetStatesFromCountry(record.country);

              $('#cbSearchQuoteShipState').combobox('loadData', states);
            }
          }
        );

        $('#cbSearchQuoteShipState').combobox
        (
          {
            valueField: 'state',
            textField: 'state',
            limitToList: true,
            data: states
          }
        );

        $('#cbSearchQuoteStatus').combobox
        (
          {
            valueField: 'id',
            textField: 'name',
            limitToList: true,
            data: orderstatustypes
          }
        );

        $('#dtSearchQuoteDateStart').datebox();
        $('#dtSearchQuoteDateEnd').datebox();

        // Note: Don't set country default here else search will try to match country and order may not have specifically entered country value...
        //$('#cbSearchOrderShipCountry').combobox('setValue', defaultCountry);
        doTextboxFocus('fldSearchQuoteNo');
      },
      buttons:
      [
        {
          text: 'Search',
          handler: function()
          {
            var quoteno = $('#fldSearchQuoteNo').textbox('getValue');
            var pono = $('#fldSearchQuotePONo').textbox('getValue');
            var name = $('#fldSearchQuoteName').textbox('getValue');
            var version = $('#fldSearchQuoteVersion').textbox('getValue');
            var clients = $('#cbSearchQuoteClients').combotree('getValues');
            var shippostcode = $('#fldSearchQuoteShipPostcode').textbox('getValue');
            var shipcity = $('#fldSearchQuoteShipCity').textbox('getValue');
            var shipcountry = $('#cbSearchQuoteShipCountry').combobox('getValue');
            var shipstate = $('#cbSearchQuoteShipState').combobox('getValue');
            var status = $('#cbSearchQuoteStatus').combobox('getValue');
            var datefrom = $('#dtSearchQuoteDateStart').datebox('getValue');
            var dateto = $('#dtSearchQuoteDateEnd').datebox('getValue');
            var maxhistory = $('#cbSearchQuoteMaxHistory').combobox('getValue');

            doServerDataMessage
            (
              'searchquotes',
              {
                quoteno: quoteno,
                pono: pono,
                name: name,
                version: version,
                clients: clients,
                shippostcode: shippostcode,
                shipcity: shipcity,
                shipcountry: shipcountry,
                shipstate: shipstate,
                status: status,
                datefrom: datefrom,
                dateto: dateto,
                maxhistory: maxhistory
              },
              {type: 'refresh'}
            );
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
            $('#dlgQuoteSearch').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
