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
        doDlgPermissionTemplateNew(null, null);
    }

    function doClear() 
    {
        $('#divPermissionTemplatesTG').treegrid('unselectAll');
    }

    

    // function doCancel() 
    // {
    //     editingId = doTreeGridCancelEdit('divPermissionTemplatesTG', editingId);
    // }

    // function doSave() 
    // {
    //     doTreeGridEndEditGetRow
    //         (
    //         'divPermissionTemplatesTG',
    //         editingId,
    //         function (row) 
    //         {
    //             doServerDataMessage
    //                 (
    //                 'saveproducttemplate',
    //                 {
    //                     producttemplateid: row.id,
    //                     name: row.name,
    //                     code: row.code,
    //                     clientid: row.clientid,
    //                     taxcodeid: row.taxcodeid,
    //                     price: row.price,
    //                     qty: row.qty
    //                 },
    //                 { type: 'refresh' }
    //                 );
    //         }
    //         );

    //     editingId = null;
    // }

    function doRemove() 
    {
        var row = $('#divPermissionTemplatesTG').treegrid('getSelected');

        if (row) 
        {
            doPromptYesNoCancel
            (
                'Remove ' + row.name + ' and ALL sub permission templates (Yes) or ONLY this template (No)?',
                function (result) 
                {
                    if (!_.isNull(result))
                        doServerDataMessage
                        (
                            'expirepermissiontemplate', 
                            { 
                                permissiontemplateid: row.id, 
                                cascade: result 
                            }, 
                            { type: 'refresh' }
                        );
                }
            );
        }
        else
            doShowError('Please select an template to remove');

        // if (rows.length == 0)
        //     doShowError('Please select one or more permission template to remove');
        // else if (rows.length == 1) 
        // {
        //     var row = rows[0];
        //     doPromptYesNoCancel
        //     (
        //         'Remove ' + row.name + ' and ALL sub permission templates (Yes) or ONLY this client (No)?',
        //         function (result) 
        //         {
        //             if (!_.isNull(result))
        //                 doServerDataMessage('expirepermissiontemplate', { permissiontemplateid: row.id, cascade: result }, { type: 'refresh' });
        //         }
        //     );
        // }
        // else 
        // {
        //     doPromptOkCancel
        //     (
        //         'Remove ' + rows.length + ' permission templates and ALL their sub permission templates?',
        //         function (result) 
        //         {
        //             if (!_.isNull(result)) 
        //             {
        //                 rows.forEach
        //                 (
        //                     function (row) 
        //                     {
        //                         doServerDataMessage('expirepermissiontemplate', { permissiontemplateid: row.id, cascade: result }, { type: 'refresh' });
        //                     }
        //                 );
        //             }
        //         }
        //     );
        // }
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


    // function doRemoveParent() 
    // {
    //     doTreeGridGetSelectedRowData
    //         (
    //         'divPermissionTemplatesTG',
    //         function (row) 
    //         {
    //             doServerDataMessage('changeproducttemplateparent', { producttemplateid: row.id, parentid: null }, { type: 'refresh' });
    //         }
    //         );
    // }

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
        $('#divPermissionTemplatesTG').treegrid('reloadFooter', [{ name: '<span class="totals_footer">' + doGetCountTreeArray(cache_permissiontemplates) + ' Templates</span>' }]);
    }

    function doSaved(ev, args) 
    {
        doServerMessage('listpermissiontemplates', { type: 'refresh', permissiontemplateid: args.data.permissiontemplateid });
    }

    // Refresh when these events occur...
    $('#divEvents').on
        (
        'listpermissiontemplates',
        function (ev, args) 
        {
            $('#divPermissionTemplatesTG').treegrid('reload');

            console.log(args.pdata.permissiontemplateid);

            doExpandTreeToId('divPermissionTemplatesTG', args.pdata.permissiontemplateid);
        }
        );

    $('#divEvents').on('newpermissiontemplate', doSaved);
    $('#divEvents').on('savepermissiontemplate', doSaved);
    $('#divEvents').on('expirepermissiontemplate', doSaved);
    $('#divEvents').on('permissiontemplatesaved', doSaved);
    $('#divEvents').on('permissiontemplatescreated', doSaved);
    $('#divEvents').on('permissiontemplateexpired', doSaved);   

    // $('#divEvents').on('saveproducttemplate', doSaved);
    // $('#divEvents').on('changeproducttemplateparent', doSaved);
    // $('#divEvents').on('duplicateproducttemplate', doSaved);
    // $('#divEvents').on('expireproducttemplate', doSaved);
    // $('#divEvents').on('producttemplatesynced', doSaved);
    // $('#divEvents').on('newproducttemplatedetail', doSaved);
    // $('#divEvents').on('saveproducttemplatedetail', doSaved);
    // $('#divEvents').on('expireproducttemplatedetail', doSaved);
    // $('#divEvents').on('producttemplatedetailcreated', doSaved);
    // $('#divEvents').on('producttemplatedetailsaved', doSaved);
    // $('#divEvents').on('producttemplatedetailexpired', doSaved);
    // $('#divEvents').on('productupdated', doSaved);

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
            // else if (args == 'cancel')
            //     doCancel();
            // else if (args == 'save')
            //     doSave();
            else if (args == 'remove')
                doRemove();
            // else if (args == 'removeparent')
            //     doRemoveParent();
            // else if (args == 'duplicate')
            //     doDuplicate();
            // else if (args == 'details')
            //     doDetails();
        }
        );

    $('#divPermissionTemplatesTG').treegrid
        (
        {
            idField: 'id',
            treeField: 'name',
            lines: true,
            collapsible: true,
            fitColumns: false,
            autoRowHeight: false,
            rownumbers: true,
            striped: true,
            toolbar: '#tbPermissionTemplates',
            showFooter: true,
            sortName: 'name',
            sortOrder: 'asc',
            remoteSort: false,
            multiSort: true,
            loader: function (param, success, error) 
            {
                success({ total: cache_permissiontemplates.length, rows: cache_permissiontemplates });
                //$('#divPermissionTemplatesTG').treegrid('collapseAll');
                console.log('Cache_permissiontemplates: ' + cache_permissiontemplates.length);
                doFooter();
            },
            frozenColumns:
                [
                    [
                    //     // { title: 'Code', field: 'code', width: 200, align: 'left', resizable: true, editor: 'text', sortable: true },
                    //         // { title: 'Id', field: 'name', width: 100, align: 'left', resizable: true, editor: 'text', sortable: true },
                        { title: 'Name', field: 'name', width: '100%', align: 'left', resizable: true, editor: 'text', sortable: true }
                    ]
                ],
            columns:
                [
                    // [
                    //     // { title: 'Id', field: 'id', width: 0, align: 'left', resizable: true, editor: 'text', sortable: true },
                    //     { title: 'Name', field: 'name', width: '100%', align: 'left', resizable: true, editor: 'text', sortable: true },
                    // ]
                ],
            onContextMenu: function (e, row) 
            {
                doTreeGridContextMenu('divPermissionTemplatesTG', 'divPermissionTemplatesMenuPopup', e, row);
            },
            onLoadSuccess: function (row) 
            {
                $(this).treegrid('enableDnd');
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
            // onDrop: function (target, source, point) 
            // {
            //     var t = _.isUN(target) ? null : target.id;

            //     doServerDataMessage('changeproducttemplateparent', { producttemplateid: source.id, parentid: t }, { type: 'refresh' });
            // },
            onDblClickCell: function (field, row) 
            {
                doDlgPermissionTemplateNew(null, row.id);
                console.log('id: ' + row.id);
                // doTreeGridStartEdit
                //     (
                //     'divPermissionTemplatesTG',
                //     editingId,
                //     function (row, id) 
                //     {
                //         editingId = id;

                //         if (['numproducts', 'modified', 'by'].indexOf(field) != -1)
                //             field = 'name';

                //         doTreeGridGetEditor
                //             (
                //             'divPermissionTemplatesTG',
                //             editingId,
                //             field,
                //             function (ed) 
                //             {
                //             }
                //             );
                //     }
                //     );
            }
        }
        );
}


