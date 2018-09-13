var permissiontemplatesTabWidgetsLoaded = false;



function doPermissionTemplatesTabSearch(value, name) 
{
    doSearchCodeNameInTree('divPermissionTemplatesTG', value);
}

function doPermissionTemplatesTabWidgets() 
{
    var editingId = null;

    if (permissiontemplatesTabWidgetsLoaded)
        return;

    permissiontemplatesTabWidgetsLoaded = true;

    // function doNewRoot() 
    // {
    //     doServerDataMessage('newproducttemplate', { parentid: null, name: 'New Template', code: 'New Code' }, { type: 'refresh' });
    // }

    function doNew() 
    {
        

        console.log('gavin1');
        var tb =
            [
                {
                    text: 'Save',
                    iconCls: 'icon-save',
                    handler: doSave
                },
                {
                    type: 'textbox',
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
                title: 'Create Permission Template',
                onClose: function () {
                    $('#divEvents').off('saveuserpermissions', doSaved);
                },
                onOpen: function () {
                    $('#divPermissionTemplatesPG1').propertygrid
                    (
                        {
                            showGroup: true,
                            scrollbarSize: 0,

                            loader: function (param, success, error) 
                            {
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

                                success({ total: cache_userpermissions.length, rows: cache_userpermissions});
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
                            diable: true,


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


        // *****************************
        // doTreeGridGetSelectedRowData
        //     (
        //     'divPermissionTemplatesTG',
        //     function (row) 
        //     {
        //         doServerDataMessage('newproducttemplate', { parentid: row.id, name: 'New Template' }, { type: 'refresh' });
        //     }
        //     );
    }

    function doClear() 
    {
        $('#divPermissionTemplatesTG').treegrid('unselectAll');
    }

    function doEdit() 
    {
        doTreeGridStartEdit
        (
            'divPermissionTemplatesTG',
            editingId,
            function (row, id) 
            {
                editingId = id;

                doTreeGridGetEditor
                    (
                    'divPermissionTemplatesTG',
                    editingId,
                    'name',
                    function (ed) 
                    {
                    }
                    );
            }
        );
    }

    function doCancel() 
    {
        editingId = doTreeGridCancelEdit('divPermissionTemplatesTG', editingId);
    }

    function doSave() 
    {
        doTreeGridEndEditGetRow
            (
            'divPermissionTemplatesTG',
            editingId,
            function (row) 
            {
                doServerDataMessage
                    (
                    'saveproducttemplate',
                    {
                        producttemplateid: row.id,
                        name: row.name,
                        code: row.code,
                        clientid: row.clientid,
                        taxcodeid: row.taxcodeid,
                        price: row.price,
                        qty: row.qty
                    },
                    { type: 'refresh' }
                    );
            }
            );

        editingId = null;
    }

    function doRemove() 
    {
        var row = $('#divPermissionTemplatesTG').treegrid('getSelected');
        if (row) 
        {
            doPromptYesNoCancel
                (
                'Remove ' + row.name + ' and ALL subtemplates (Yes) or ONLY this template (No)?',
                function (result) 
                {
                    if (!_.isNull(result))
                        doServerDataMessage('expireproducttemplate', { producttemplateid: row.id, cascade: result }, { type: 'refresh' });
                }
                );
        }
        else
            doShowError('Please select an template to remove');
    }

    function doDuplicate() 
    {
        doTreeGridGetSelectedRowData
            (
            'divPermissionTemplatesTG',
            function (row) 
            {
                doServerDataMessage('duplicateproducttemplate', { producttemplateid: row.id }, { type: 'refresh' });
            }
            );
    }

    function doDetails() 
    {
        if (!doTreeGridGetSelectedRowData
           (
            'divPermissionTemplatesTG',
            function (row) 
            {
                doDlgTemplateDetails(row);
            }
            )) 
        {
            doShowError('Please select a template to view/edit details');
        }
    }

    function doRemoveParent() 
    {
        doTreeGridGetSelectedRowData
            (
            'divPermissionTemplatesTG',
            function (row) 
            {
                doServerDataMessage('changeproducttemplateparent', { producttemplateid: row.id, parentid: null }, { type: 'refresh' });
            }
            );
    }

    function doCalcUnitCost(value, row, index) 
    {
        var qty = _.toBigNum(row.qty);

        if (!qty.isZero()) 
        {
            var u = _.toBigNum(row.totalprice).dividedBy(qty);
            return _.formatnumber(u, 6);
        }
    }

    function doFooter() 
    {
        $('#divPermissionTemplatesTG').treegrid('reloadFooter', [{ code: '<span class="totals_footer">' + doGetCountTreeArray(cache_producttemplates) + ' Templates</span>' }]);
    }

    function doSaved(ev, args) 
    {
        doServerMessage('listproducttemplates', { type: 'refresh', producttemplateid: args.data.producttemplateid });
    }

    // Refresh when these events occur...
    $('#divEvents').on
        (
        'listproducttemplates',
        function (ev, args) 
        {
            $('#divPermissionTemplatesTG').treegrid('reload');

            doExpandTreeToId('divPermissionTemplatesTG', args.pdata.producttemplateid);
        }
        );

    $('#divEvents').on('newproducttemplate', doSaved);
    $('#divEvents').on('saveproducttemplate', doSaved);
    $('#divEvents').on('changeproducttemplateparent', doSaved);
    $('#divEvents').on('duplicateproducttemplate', doSaved);
    $('#divEvents').on('expireproducttemplate', doSaved);
    $('#divEvents').on('producttemplatesynced', doSaved);
    $('#divEvents').on('newproducttemplatedetail', doSaved);
    $('#divEvents').on('saveproducttemplatedetail', doSaved);
    $('#divEvents').on('expireproducttemplatedetail', doSaved);
    $('#divEvents').on('producttemplatedetailcreated', doSaved);
    $('#divEvents').on('producttemplatedetailsaved', doSaved);
    $('#divEvents').on('producttemplatedetailexpired', doSaved);
    $('#divEvents').on('productupdated', doSaved);

    $('#divEvents').on
        (
        'permissiontemplatespopup',
        function (ev, args) 
        {
            if (args == 'newroot')
                doNewRoot();
            else if (args == 'new')
                doNew();
            else if (args == 'clear')
                doClear();
            else if (args == 'edit')
                doEdit();
            else if (args == 'cancel')
                doCancel();
            else if (args == 'save')
                doSave();
            else if (args == 'remove')
                doRemove();
            else if (args == 'removeparent')
                doRemoveParent();
            else if (args == 'duplicate')
                doDuplicate();
            else if (args == 'details')
                doDetails();
        }
        );

    $('#divPermissionTemplatesTG').treegrid
        (
        {
            idField: 'id',
            treeField: 'code',
            lines: true,
            collapsible: true,
            fitColumns: false,
            autoRowHeight: false,
            rownumbers: true,
            striped: true,
            toolbar: '#tbPermissionTemplates',
            showFooter: true,
            sortName: 'code',
            sortOrder: 'asc',
            remoteSort: false,
            multiSort: true,
            loader: function (param, success, error) 
            {
                success({ total: cache_producttemplates.length, rows: cache_producttemplates });
                //$('#divPermissionTemplatesTG').treegrid('collapseAll');

                doFooter();
            },
            // frozenColumns:
            //     [
            //         [
            //             // { title: 'Code', field: 'code', width: 200, align: 'left', resizable: true, editor: 'text', sortable: true },
            //                 { title: 'Name', field: 'name', width: 500, align: 'left', resizable: true, editor: 'text', sortable: true }
            //         ]
            //     ],
            columns:
                [
                    [
                        { title: 'Name', field: 'name', width: 500, align: 'left', resizable: true, editor: 'text', sortable: true },
                        // { title: 'Client', field: 'clientid', width: 200, align: 'left', resizable: true, editor: { type: 'combobox', options: { valueField: 'id', textField: 'name', data: cache_clients, onSelect: function (record) {/*console.log(record);*/ } } }, formatter: function (value, row) { return doGetStringFromIdInObjArray(cache_clients, value); } },
                        // { title: 'Tax Code', field: 'taxcodeid', width: 200, align: 'left', resizable: true, editor: { type: 'combobox', options: { valueField: 'id', textField: 'name', data: cache_taxcodes, onSelect: function (record) {/*console.log(record);*/ } } }, formatter: function (value, row) { return doGetStringFromIdInObjArray(cache_taxcodes, value); } },
                        // { title: 'RRP', field: 'price', width: 150, align: 'right', resizable: true, editor: { type: 'numberbox', options: { groupSeparator: ',', precision: 2 } }, formatter: function (value, row, index) { return _.niceformatnumber(value); } },
                        // { title: 'Qty', field: 'qty', width: 150, align: 'right', resizable: true, editor: { type: 'numberbox', options: { groupSeparator: ',', precision: 0 } }, formatter: function (value, row, index) { return _.niceformatqty(value); } },
                        // { title: 'Total Cost', field: 'totalprice', width: 150, align: 'right', resizable: true, formatter: function (value, row, index) { return _.niceformatnumber(value); } },
                        // { title: '#Products', field: 'numproducts', width: 150, align: 'right', resizable: true },
                        // { title: 'Unit Cost', field: 'unitcost', width: 150, align: 'right', resizable: true, formatter: function (value, row, index) { return doCalcUnitCost(value, row, index); } },
                        // { title: 'Modified', field: 'date', width: 150, align: 'right', resizable: true, sortable: true },
                        // { title: 'By', field: 'by', width: 200, align: 'left', resizable: true, sortable: true }
                    ]
                ],
            onContextMenu: function (e, row) 
            {
                doTreeGridContextMenu('divPermissionTemplatesTG', 'divPermissionTemplatesMenuPopup', e, row);
            },
            onLoadSuccess: function (row) 
            {
                $(this).treegrid('enableDnd');
            },
            onDblClickCell: function (field, row) 
            {
            },
            onBeforeDrag: function (source) 
            {
                if (editingId)
                    return false;
                return true;
            },
            onDragOver: function (target, source) 
            {
                return _.isUN(target) ? false : true;
            },
            onBeforeDrop: function (target, source, point)
             {
                return true;
            },
            onDrop: function (target, source, point) 
            {
                var t = _.isUN(target) ? null : target.id;

                doServerDataMessage('changeproducttemplateparent', { producttemplateid: source.id, parentid: t }, { type: 'refresh' });
            },
            onDblClickCell: function (field, row) 
            {
                doTreeGridStartEdit
                    (
                    'divPermissionTemplatesTG',
                    editingId,
                    function (row, id) 
                    {
                        editingId = id;

                        if (['numproducts', 'modified', 'by'].indexOf(field) != -1)
                            field = 'name';

                        doTreeGridGetEditor
                            (
                            'divPermissionTemplatesTG',
                            editingId,
                            field,
                            function (ed) 
                            {
                            }
                            );
                    }
                    );
            }
        }
        );
}


