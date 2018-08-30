function doDlgClientSearch()
{
  function doReset()
  {
    $('#fldSearchClientCode').textbox('clear');
    $('#fldSearchClientName').textbox('clear');
    $('#fldSearchClientEmail').textbox('clear');
    $('#fldSearchClientPhone').textbox('clear');
    $('#fldSearchClientContact').textbox('clear');

    $('#dtSearchClientDateStart').datebox('clear');
    $('#dtSearchClientDateEnd').datebox('clear');

    doServerMessage('listclients', {type: 'refresh'});
  }

  $('#dlgClientSearch').dialog
  (
    {
      onClose: function()
      {
      },
      onOpen: function()
      {
        $('#dtSearchClientDateStart').datebox();
        $('#dtSearchClientDateEnd').datebox();

        doTextboxFocus('fldSearchClientCode');
      },
      buttons:
      [
        {
          text: 'Search',
          handler: function()
          {
            var code = $('#fldSearchClientCode').textbox('getValue');
            var name = $('#fldSearchClientName').textbox('getValue');
            var email = $('#fldSearchClientEmail').textbox('getValue');
            var phone = $('#fldSearchClientPhone').textbox('getValue');
            var contact = $('#fldSearchClientContact').textbox('getValue');
            var datefrom = $('#dtSearchClientDateStart').datebox('getValue');
            var dateto = $('#dtSearchClientDateEnd').datebox('getValue');
            var maxhistory = $('#cbSearchClientMaxHistory').combobox('getValue');

            doServerDataMessage
            (
              'searchclients',
              {
                code: code,
                name: name,
                email: email,
                phone: phone,
                contact: contact,
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
            $('#dlgClientSearch').dialog('close');
          }
        }
      ]
    }
  ).dialog('center').dialog('open');
}
