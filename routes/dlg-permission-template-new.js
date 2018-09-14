var selectedPermissionTemplateId = null;

function doDlgPermissionTemplateNew(templateid) 
{
    var isnew = _.isUndefined(templateid) || _.isNull(templateid);

    console.log('gavin1');

    var tb =
        [
            {
                text: 'Save',
                iconCls: 'icon-save',
                handler: doSave
            }
        ];



    function doSave() {
        var rows = $('#divPermissionTemplatesPG').propertygrid('getRows');
        var permissions =
        {
            canvieworders: rows[0].value,
            cancreateorders: rows[1].value,
            canviewinvoices: rows[2].value,
            cancreateinvoices: rows[3].value,
            canviewinventory: rows[4].value,
            cancreateinventory: rows[5].value,
            canviewpayroll: rows[6].value,
            cancreatepayroll: rows[7].value,
            canviewproducts: rows[8].value,
            cancreateproducts: rows[9].value,
            canviewclients: rows[10].value,
            cancreateclients: rows[11].value,
            canviewcodes: rows[12].value,
            cancreatecodes: rows[13].value,
            canviewusers: rows[14].value,
            cancreateusers: rows[15].value,
            canviewbuilds: rows[16].value,
            cancreatebuilds: rows[17].value,
            canviewtemplates: rows[18].value,
            cancreatetemplates: rows[19].value,
            canviewbanking: rows[20].value,
            cancreatebanking: rows[21].value,
            canviewpurchasing: rows[22].value,
            cancreatepurchasing: rows[23].value,
            canviewalerts: rows[24].value,
            cancreatealerts: rows[25].value,
            canviewdashboard: rows[26].value,
            cancreatedashboard: rows[27].value
        };

        doServerDataMessage('saveuserpermissions', { useruuid: user.uuid, permissions: permissions }, { type: 'refresh' });
    }



    function doMakeRowProperty(name, value, group) {
        var row =
        {
            name: name,
            value: value,
            group: group,
            editor:
            {
                type: 'checkbox',
                options:
                {
                    on: 1,
                    off: 0
                }
            }
        };

        return row;
    }

    function doCreateRowName(name, value, group) {
        var row =
        {
            name: name,
            value: value,
            group: group,
            editor:
            {
                type: 'textarea',
                id: 'fldNewPermissionTemplateName',
            }
        };

        return row;
    }

    function doSaved(ev, args) {
        $('#dlgPermissionTemplates').dialog('close');
    }

    $('#divEvents').on('saveuserpermissions', doSaved);

    $('#dlgPermissionTemplates').dialog
        (
        {
            title: 'Create User Permission Template',
            onClose: function () {
                $('#divEvents').off('saveuserpermissions', doSaved);
            },
            onOpen: function () {
                $('#divPermissionTemplatesPG1').propertygrid
                    (
                    {
                        showGroup: true,
                        scrollbarSize: 0,

                        loader: function (param, success, error) {
                            cache_permissionTemplateNames = [];

                            cache_permissionTemplateNames.push(doCreateRowName('Name', '', 'Template'));
                            success({ total: cache_permissionTemplateNames.length, rows: cache_permissionTemplateNames });
                        },
                        columns:
                            [

                                [
                                    { field: 'name', title: 'Name', width: 70 },
                                    {
                                        field: 'value',
                                        title: 'Value',
                                        width: 100
                                    }
                                ]
                            ]
                    }

                    );

                $('#divPermissionTemplatesPG2').propertygrid
                    (
                    {
                        showGroup: true,
                        scrollbarSize: 0,
                        // toolbar: tb,

                        loader: function (param, success, error) {
                            cache_userpermissions = [];

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Orders'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Orders'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Invoices'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Invoices'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Inventory'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Inventory'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Payroll'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Payroll'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Products'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Products'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Clients'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Clients'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Codes'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Codes'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Users'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Users'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Builds'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Builds'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Templates'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Templates'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Banking'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Banking'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Purchasing'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Purchasing'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Alerts'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Alerts'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', false, 'Dashboard'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', false, 'Dashboard'));

                            success({ total: cache_userpermissions.length, rows: cache_userpermissions });
                        },
                        columns:
                            [

                                [
                                    { field: 'name', title: 'Action', width: 70 },
                                    {
                                        field: 'value',
                                        title: 'Permission',
                                        width: 100,
                                        formatter: function (value, row, index) {
                                            return mapBoolToImage(value);
                                        }
                                    }
                                ]
                            ]
                    }
                    );
            },
            buttons:
                [
                    {
                        text: 'Add',
                        id: 'btnPermissionTemplateNewAdd',
                        handler: function () 
                        {
                            var name = $('#divPermissionTemplatesPG1').propertygrid('getRows')[0].value;
                            
                            var canvieworders = $('#divPermissionTemplatesPG2').propertygrid('getRows')[0].value;
                            var cancreateorders = $('#divPermissionTemplatesPG2').propertygrid('getRows')[1].value;
                            var canviewinvoices = $('#divPermissionTemplatesPG2').propertygrid('getRows')[2].value;
                            var cancreateinvoices = $('#divPermissionTemplatesPG2').propertygrid('getRows')[3].value;
                            var canviewinventory = $('#divPermissionTemplatesPG2').propertygrid('getRows')[4].value;
                            var cancreateinventory = $('#divPermissionTemplatesPG2').propertygrid('getRows')[5].value;
                            var canviewpayroll = $('#divPermissionTemplatesPG2').propertygrid('getRows')[6].value;
                            var cancreatepayroll = $('#divPermissionTemplatesPG2').propertygrid('getRows')[7].value;
                            var canviewproducts = $('#divPermissionTemplatesPG2').propertygrid('getRows')[8].value;
                            var cancreateproducts = $('#divPermissionTemplatesPG2').propertygrid('getRows')[9].value;
                            var canviewclients = $('#divPermissionTemplatesPG2').propertygrid('getRows')[10].value;
                            var cancreateclients = $('#divPermissionTemplatesPG2').propertygrid('getRows')[11].value;
                            var canviewcodes = $('#divPermissionTemplatesPG2').propertygrid('getRows')[12].value;
                            var cancreatecodes = $('#divPermissionTemplatesPG2').propertygrid('getRows')[13].value;
                            var canviewusers = $('#divPermissionTemplatesPG2').propertygrid('getRows')[14].value;
                            var cancreateusers = $('#divPermissionTemplatesPG2').propertygrid('getRows')[15].value;
                            var canviewbuilds = $('#divPermissionTemplatesPG2').propertygrid('getRows')[16].value;
                            var cancreatebuilds = $('#divPermissionTemplatesPG2').propertygrid('getRows')[17].value;
                            var canviewtemplates = $('#divPermissionTemplatesPG2').propertygrid('getRows')[18].value;
                            var cancreatetemplates = $('#divPermissionTemplatesPG2').propertygrid('getRows')[19].value;
                            var canviewbanking = $('#divPermissionTemplatesPG2').propertygrid('getRows')[20].value;
                            var cancreatebanking = $('#divPermissionTemplatesPG2').propertygrid('getRows')[21].value;
                            var canviewpurchasing = $('#divPermissionTemplatesPG2').propertygrid('getRows')[22].value;
                            var cancreatepurchasing = $('#divPermissionTemplatesPG2').propertygrid('getRows')[23].value;
                            var canviewalerts = $('#divPermissionTemplatesPG2').propertygrid('getRows')[24].value;
                            var cancreatealerts = $('#divPermissionTemplatesPG2').propertygrid('getRows')[25].value;
                            var canviewdashboard = $('#divPermissionTemplatesPG2').propertygrid('getRows')[26].value;
                            var cancreatedashboard = $('#divPermissionTemplatesPG2').propertygrid('getRows')[27].value;
                            
                            if (!_.isBlank(name))
                            {
                                if (isnew)
                                {
                                    doServerDataMessage
                                    (
                                        'newpermissiontemplate',
                                        {
                                            name: name,

                                            canvieworders: canvieworders,
                                            cancreateorders: cancreateorders,

                                            canviewinvoices: canviewinvoices,
                                            cancreateinvoices: cancreateinvoices,

                                            canviewinventory: canviewinventory,
                                            cancreateinventory: cancreateinventory,

                                            canviewpayroll: canviewpayroll,
                                            cancreatepayroll: cancreatepayroll,

                                            canviewproducts: canviewproducts,
                                            cancreateproducts: cancreateproducts,

                                            canviewclients: canviewclients,
                                            cancreateclients: cancreateclients,

                                            canviewcodes: canviewcodes,
                                            cancreatecodes: cancreatecodes,

                                            canviewusers: canviewusers,
                                            cancreateusers: cancreateusers,

                                            canviewbuilds: canviewbuilds,
                                            cancreatebuilds: cancreatebuilds,

                                            canviewtemplates: canviewtemplates,
                                            cancreatetemplates: cancreatetemplates,

                                            canviewbanking: canviewbanking,
                                            cancreatebanking: cancreatebanking,

                                            canviewpurchasing: canviewpurchasing,
                                            cancreatepurchasing: cancreatepurchasing,

                                            canviewalerts: canviewalerts,
                                            cancreatealerts: cancreatealerts,

                                            canviewdashboard: canviewdashboard,
                                            cancreatedashboard: cancreatedashboard
                                        },
                                        { type: 'refresh'}
                                    );
                                }
                                else
                                {
                                    
                                }
                            }
                            else
                                doMandatoryTextbox('Please enter a permission template name','fldNewPermissionTemplateName');
                        }
                    },
                    {
                        text: 'Close',
                        handler: function () {
                            $('#dlgPermissionTemplates').dialog('close');
                        }
                    }
                ]
        }
        ).dialog('center').dialog('open');






}