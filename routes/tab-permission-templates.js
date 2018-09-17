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
        doDlgPermissionTemplateNew(null);
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
        $('#divPermissionTemplatesTG').treegrid('reloadFooter', [{ code: '<span class="totals_footer">' + doGetCountTreeArray(cashe_permissiontemplates) + ' Templates</span>' }]);
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

            doExpandTreeToId('divPermissionTemplatesTG', args.pdata.permissiontemplateid);
        }
        );

    $('#divEvents').on('newproducttemplate', doSaved);
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
            else if (args == 'edit')
                doEdit();
            else if (args == 'cancel')
                doCancel();
            else if (args == 'save')
                doSave();
            else if (args == 'remove')
                doRemove();
            // else if (args == 'removeparent')
            //     doRemoveParent();
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
                success({ total: cashe_permissiontemplates.length, rows: cashe_permissiontemplates });
                //$('#divPermissionTemplatesTG').treegrid('collapseAll');
                console.log(cashe_permissiontemplates.length);
                doFooter();
            },
            frozenColumns:
                [
                    [
                        // { title: 'Code', field: 'code', width: 200, align: 'left', resizable: true, editor: 'text', sortable: true },
                            { title: 'Id', field: 'name', width: 100, align: 'left', resizable: true, editor: 'text', sortable: true }
                    ]
                ],
            columns:
                [
                    [
                        { title: 'Name', field: 'name', width: 500, align: 'left', resizable: true, editor: 'text', sortable: true },
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
            // onDrop: function (target, source, point) 
            // {
            //     var t = _.isUN(target) ? null : target.id;

            //     doServerDataMessage('changeproducttemplateparent', { producttemplateid: source.id, parentid: t }, { type: 'refresh' });
            // },
            // onDblClickCell: function (field, row) 
            // {
            //     doTreeGridStartEdit
            //         (
            //         'divPermissionTemplatesTG',
            //         editingId,
            //         function (row, id) 
            //         {
            //             editingId = id;

            //             if (['numproducts', 'modified', 'by'].indexOf(field) != -1)
            //                 field = 'name';

            //             doTreeGridGetEditor
            //                 (
            //                 'divPermissionTemplatesTG',
            //                 editingId,
            //                 field,
            //                 function (ed) 
            //                 {
            //                 }
            //                 );
            //         }
            //         );
            // }
        }
        );
}


