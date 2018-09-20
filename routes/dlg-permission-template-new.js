var selectedPermissionTemplateId = null;

function doDlgPermissionTemplateNew(parentid, templateid) 
{
    var isnew = _.isUndefined(templateid) || _.isNull(templateid);
    var permissiontemplate = {};

    console.log('gavin1');

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

    function doSaved(ev, args) 
    {
        $('#dlgPermissionTemplates').dialog('close');
    }

    function doLoad(ev, args) 
    {
        permissiontemplate = (args.data.permissiontemplate);
        doReset();
    }

    function doReset() 
    {
        if (isnew) 
        {
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

                    loader: function (param, success, error) {
                        cache_userpermissions = [];

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Orders'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Orders'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Invoices'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Invoices'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Inventory'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Inventory'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Payroll'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Payroll'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Products'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Products'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Clients'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Clients'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Codes'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Codes'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Users'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Users'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Builds'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Builds'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Templates'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Templates'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Banking'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Banking'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Purchasing'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Purchasing'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Alerts'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Alerts'));

                        cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Dashboard'));
                        cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Dashboard'));

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
        }
        else
        {
            if (!_.isEmpty(permissiontemplate))
            {
                console.log(permissiontemplate.name);
                // $('#divPermissionTemplatesPG1').propertygrid('setRows')[0].value = permissiontemplate.name;
                // $('#divPermissionTemplatesPG2').propertygrid('setRows')[0].value = permissiontemplate.canvieworders;
                $('#divPermissionTemplatesPG1').propertygrid
                (
                    {
                        showGroup: true,
                        scrollbarSize: 0,

                        loader: function (param, success, error) {
                            cache_permissionTemplateNames = [];

                            cache_permissionTemplateNames.push(doCreateRowName('Name', permissiontemplate.name, 'Template'));
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

                        loader: function (param, success, error) {
                            cache_userpermissions = [];

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canvieworders, 'Orders'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreateorders, 'Orders'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewinvoices, 'Invoices'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreateinvoices, 'Invoices'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewinventory, 'Inventory'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreateinventory, 'Inventory'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewpayroll, 'Payroll'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreatepayroll, 'Payroll'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewproducts, 'Products'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreateproducts, 'Products'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewclients, 'Clients'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreateclients, 'Clients'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewcodes, 'Codes'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreatecodes, 'Codes'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewusers, 'Users'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreateusers, 'Users'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewbuilds, 'Builds'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreatebuilds, 'Builds'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewtemplates, 'Templates'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreatetemplates, 'Templates'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewbanking, 'Banking'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreatebanking, 'Banking'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewpurchasing, 'Purchasing'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreatepurchasing, 'Purchasing'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewalerts, 'Alerts'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreatealerts, 'Alerts'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', permissiontemplate.canviewdashboard, 'Dashboard'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', permissiontemplate.cancreatedashboard, 'Dashboard'));

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
            }
        }
    }

    $('#divEvents').on('newpermissiontemplate', doSaved);
    $('#divEvents').on('savepermissiontemplate', doSaved);
    $('#divEvents').on('loadpermissiontemplate', doLoad);

    $('#dlgPermissionTemplates').dialog
        (
        {
            title: 'Create User Permission Template',
            onClose: function () 
            {
                $('#divEvents').off('newpermissiontemplate', doSaved);
                $('#divEvents').off('savepermissiontemplate', doSaved);
                $('#divEvents').off('loadpermissiontemplate', doLoad);
            },
            onOpen: function () 
            {
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

                        loader: function (param, success, error) {
                            cache_userpermissions = [];

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Orders'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Orders'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Invoices'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Invoices'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Inventory'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Inventory'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Payroll'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Payroll'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Products'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Products'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Clients'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Clients'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Codes'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Codes'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Users'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Users'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Builds'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Builds'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Templates'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Templates'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Banking'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Banking'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Purchasing'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Purchasing'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Alerts'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Alerts'));

                            cache_userpermissions.push(doMakeRowProperty('Can View', 0, 'Dashboard'));
                            cache_userpermissions.push(doMakeRowProperty('Can Create', 0, 'Dashboard'));

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

                if (isnew)
                    $('#btnPermissionTemplateNewAdd').linkbutton({ text: 'Add' });
                else
                    $('#btnPermissionTemplateNewAdd').linkbutton({ text: 'Save' });

                if (!_.isUndefined(templateid) && !_.isNull(templateid)) 
                    doServerDataMessage('loadpermissiontemplate', { permissiontemplateid: templateid }, { type: 'refresh' });
                else
                    doReset();
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
                                    doServerDataMessage
                                    (
                                        'savepermissiontemplate',
                                        {
                                            permissiontemplateid: templateid,

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
                                        { type: 'refresh' }
                                    );
                                }
                            }
                            else
                                doMandatoryTextbox('Please enter a permission template name','fldNewPermissionTemplateName');
                        }
                    },
                    {
                        text: 'Reset',
                        handler: function () 
                        {
                            doReset();
                        }
                    },
                    {
                        text: 'Close',
                        handler: function () 
                        {
                            $('#dlgPermissionTemplates').dialog('close');
                        }
                    }
                ]
        }
        ).dialog('center').dialog('open');
}