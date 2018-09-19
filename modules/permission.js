// *******************************************************************************************************************************************************************************************
// Internal functions
function doNewPermissionTemplate(tx, world) 
{
    var promise = new global.rsvp.Promise
    (
        function (resolve, reject) 
        {
            tx.query
            (
                'insert into permissiontemplatedetails (name,canvieworders,cancreateorders,canviewinvoices,cancreateinvoices,canviewinventory,cancreateinventory,canviewpayroll,cancreatepayroll,canviewproducts,cancreateproducts,canviewclients,cancreateclients,canviewcodes,cancreatecodes,canviewusers,cancreateusers,canviewbuilds,cancreatebuilds,canviewtemplates,cancreatetemplates,canviewbanking,cancreatebanking,canviewpurchasing,cancreatepurchasing,canviewalerts,cancreatealerts,canviewdashboard,cancreatedashboard) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29) returning id', 
                [
                    __.sanitiseAsString(world.name, 50),

                    world.canvieworders,
                    world.cancreateorders,

                    world.canviewinvoices,
                    world.cancreateinvoices,

                    world.canviewinventory,
                    world.cancreateinventory,

                    world.canviewpayroll,
                    world.cancreatepayroll,

                    world.canviewproducts,
                    world.cancreateproducts,

                    world.canviewclients,
                    world.cancreateclients,
 
                    world.canviewcodes,
                    world.cancreatecodes,
                    
                    world.canviewusers,
                    world.cancreateusers,

                    world.canviewbuilds,
                    world.cancreatebuilds,

                    world.canviewtemplates,
                    world.cancreatetemplates,

                    world.canviewbanking,
                    world.cancreatebanking,

                    world.canviewpurchasing,
                    world.cancreatepurchasing,

                    world.canviewalerts,
                    world.cancreatealerts,

                    world.canviewdashboard,
                    world.cancreatedashboard
                ],
                function (err, result) 
                {
                    if (!err) 
                    {
                        var permissiontemplateid = result.rows[0].id;

                        tx.query
                        (
                            'select * from permissiontemplatedetails where id = $1',
                            [
                                __.sanitiseAsBigInt(permissiontemplateid)
                            ],
                            function (err, result) 
                            {
                                if (!err) 
                                {
                                    var pc = result.rows[0];

                                    resolve({permissiontemplateid: permissiontemplateid })
                                } 
                                else 
                                    reject({ message: global.text_unablenewpermissiontemplatedetail });
                            }
                        );
                    } 
                    else 
                        reject(err);                   
                }
            );
        }
    );

    return promise;
}

function doSavePermissionTemplate(tx, world) 
{
    var promise = new global.rsvp.Promise
    (
        function (resolve, reject) 
        {
            tx.query
            (
                'update ' +
                'permissiontemplatedetails ' +
                'set ' + 
                'name=$1,' + 
                'canvieworders=$2,' +
                'cancreateorders=$3,' +
                'canviewinvoices=$4,' +
                'cancreateinvoices=$5,' + 
                'canviewinventory=$6,' + 
                'cancreateinventory=$7,' + 
                'canviewpayroll=$8,' + 
                'cancreatepayroll=$9,' + 
                'canviewproducts=$10,' + 
                'cancreateproducts=$11,' + 
                'canviewclients=$12,' + 
                'cancreateclients=$13,' + 
                'canviewcodes=$14,' + 
                'cancreatecodes=$15,' + 
                'canviewusers=$16,' + 
                'cancreateusers=$17,' + 
                'canviewbuilds=$18,' +
                'cancreatebuilds=$19,' + 
                'canviewtemplates=$20,' +
                'cancreatetemplates=$21,' + 
                'canviewbanking=$22,' + 
                'cancreatebanking=$23,' + 
                'canviewpurchasing=$24,' + 
                'cancreatepurchasing=$25,' + 
                'canviewalerts=$26,' + 
                'cancreatealerts=$27,' + 
                'canviewdashboard=$28,' + 
                'cancreatedashboard=$29 ' +
                'where id=$30',
                [
                    __.sanitiseAsString(world.name, 50),

                    world.canvieworders,
                    world.cancreateorders,

                    world.canviewinvoices,
                    world.cancreateinvoices,

                    world.canviewinventory,
                    world.cancreateinventory,

                    world.canviewpayroll,
                    world.cancreatepayroll,

                    world.canviewproducts,
                    world.cancreateproducts,

                    world.canviewclients,
                    world.cancreateclients,
 
                    world.canviewcodes,
                    world.cancreatecodes,
                    
                    world.canviewusers,
                    world.cancreateusers,

                    world.canviewbuilds,
                    world.cancreatebuilds,

                    world.canviewtemplates,
                    world.cancreatetemplates,

                    world.canviewbanking,
                    world.cancreatebanking,

                    world.canviewpurchasing,
                    world.cancreatepurchasing,

                    world.canviewalerts,
                    world.cancreatealerts,

                    world.canviewdashboard,
                    world.cancreatedashboard


                ],
            );
        }
    );
    return promise;
}




// *******************************************************************************************************************************************************************************************
// Public functions
function LoadPermissionTemplate(world) 
{
    var msg = '[' + world.eventname + '] ';
    //
    global.pg.connect
    (
        global.cs,
        function (err, client, done) 
        {
            if (!err) 
            {
                client.query
                (
                    'select ' + 
                    'id,' +
                    'name,' + 
                    'canvieworders,' +
                    'cancreateorders,' +
                    'canviewinvoices,' +
                    'cancreateinvoices,' + 
                    'canviewinventory,' + 
                    'cancreateinventory,' + 
                    'canviewpayroll,' + 
                    'cancreatepayroll,' + 
                    'canviewproducts,' + 
                    'cancreateproducts,' + 
                    'canviewclients,' + 
                    'cancreateclients,' + 
                    'canviewcodes,' + 
                    'cancreatecodes,' + 
                    'canviewusers,' + 
                    'cancreateusers,' + 
                    'canviewbuilds,' +
                    'cancreatebuilds,' + 
                    'canviewtemplates,' +
                    'cancreatetemplates,' + 
                    'canviewbanking,' + 
                    'cancreatebanking,' + 
                    'canviewpurchasing,' + 
                    'cancreatepurchasing,' + 
                    'canviewalerts,' + 
                    'cancreatealerts,' + 
                    'canviewdashboard,' + 
                    'cancreatedashboard ' +
                    'from permissiontemplatedetails ' + 
                    'where id=$1',
                    [
                        __.sanitiseAsBigInt(world.permissiontemplateid)
                    ],
                    function (err, result) 
                    {
                        done();

                        if (!err) 
                        {
                            world.spark.emit
                            (
                                world.eventname, 
                                { 
                                    rc: global.errcode_none, 
                                    msg: global.text_success, 
                                    fguid: world.fguid, 
                                    permissiontemplate: result.rows[0], 
                                    pdata: world.pdata 
                                }
                            );
                        } 
                        else 
                        {
                            msg += global.text_generalexception + ' ' + err.message;
                            global.log.error({ loadpermissiontemplate: true }, msg);
                            world.spark.emit(global.eventerror, { rc: global.errcode_fatal, msg: msg, pdata: world.pdata });
                        }
                    }
                );
            } 
            else 
            {
                global.log.error({ loadpermissiontemplate: true }, global.text_nodbconnection);
                world.spark.emit(global.eventerror, { rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata });
            }
        }
    );
}

function NewPermissionTemplate(world) 
{
    var msg = '[' + world.eventname + '] ';
    // ******
    global.pg.connect
    (
        global.cs,
        function (err, client, done) 
        {
            if (!err) 
            {
                var tx = new global.pgtx(client);
                tx.begin
                (
                    function (err) 
                    {
                        if (!err) 
                        {
                            doNewPermissionTemplate(tx, world).then
                            (
                                function (result) 
                                {
                                    tx.commit
                                    (
                                        function (err) 
                                        {
                                            if (!err) 
                                            {
                                                done();
                                                world.spark.emit
                                                (
                                                    world.eventname,
                                                    {
                                                        rc: global.errcode_none,
                                                        msg: global.text_success,
                                                        permissiontemplateid: result.permissiontemplateid,
                                                        // datecreated: result.datecreated,
                                                        // usercreated: result.usercreated,
                                                        pdata: world.pdata
                                                    }
                                                );
                                                global.pr.sendToRoomExcept
                                                (
                                                    global.custchannelprefix + world.cn.custid,
                                                    'permissiontemplatecreated',
                                                    {
                                                        permissiontemplateid: result.permissiontemplateid,
                                                        // datecreated: result.datecreated,
                                                        // usercreated: result.usercreated
                                                    },
                                                    world.spark.id
                                                );
                                                // global.pr.sendToRomm();
                                            } 
                                            else 
                                            {
                                                tx.rollback
                                                (
                                                    function (ignore) 
                                                    {
                                                        done();
                                                        msg += global.text_tx + ' ' + err.message;
                                                        global.log.error({newpermissiontemplate: true}, msg);
                                                        world.spark.emit(global.eventerror, { rc: global.errcode_dberr, msg: msg, pdata: world.pdata });
                                                    }
                                                );
                                            }
                                        }
                                    );
                                }
                            ).then
                            (
                                null,
                                function (err) 
                                {
                                    tx.rollback
                                    (
                                        function (ignore) 
                                        {
                                            done();

                                            msg += global.text_generalexception + ' ' + err.message;
                                            global.log.error({ newpermissiontemplate: true}, msg);
                                            world.spark.emit(global.eventerror, { rc: global.errcode_fatal, msg: msg, pdata: world.pdata });
                                        }
                                    );
                                }
                            );
                        } 
                        else 
                        {
                            done();
                            msg += global.text_nodbconnection + ' ' + err.message;
                            global.log.error({newpermissiontemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode.dberr, msg: msg, pdata: world.pdata});                           
                        }
                        
                    }
                );
            } 
            else 
            {
                global.log.error({ newpermissiontemplate: true}, global.text_nodbconnection);
                world.spark.emit(global.eventerror, { rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
            }
        }
    );
}

function ListPermissionTemplates(world) 
{
    var msg = '[' + world.eventname + '] ';
    //
    global.pg.connect
    (
        global.cs,
        function (err, client, done) 
        {
            if (!err) 
            {
                client.query
                (
                    'select ' + 
                    'id,' +
                    'name,' + 
                    'canvieworders,' +
                    'cancreateorders,' +
                    'canviewinvoices,' +
                    'cancreateinvoices,' + 
                    'canviewinventory,' + 
                    'cancreateinventory,' + 
                    'canviewpayroll,' + 
                    'cancreatepayroll,' + 
                    'canviewproducts,' + 
                    'cancreateproducts,' + 
                    'canviewclients,' + 
                    'cancreateclients,' + 
                    'canviewcodes,' + 
                    'cancreatecodes,' + 
                    'canviewusers,' + 
                    'cancreateusers,' + 
                    'canviewbuilds,' +
                    'cancreatebuilds,' + 
                    'canviewtemplates,' +
                    'cancreatetemplates,' + 
                    'canviewbanking,' + 
                    'cancreatebanking,' + 
                    'canviewpurchasing,' + 
                    'cancreatepurchasing,' + 
                    'canviewalerts,' + 
                    'cancreatealerts,' + 
                    'canviewdashboard,' + 
                    'cancreatedashboard ' +
                    'from permissiontemplatedetails',
                    function (err, result) 
                    {
                        done();
                        
                        if (!err) 
                        {
                            // result.rows.forEach(element => 
                            //     {
                            //         if (__.isUndefined())
                            //     }
                            // );
                            world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
                        } 
                        else 
                        {
                            msg += global.text_generalexception + ' ' + err.message;
                            global.log.error({listpermissiontemplates: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                        }
                    }
                );
            } 
            else 
            {
                global.log.error({ listpermissiontemplates: true}, global.text_nodbconnection);
                world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
            }   
        }
    );
}

function SavePermissionTemplate(world) 
{
    var msg = '[' + world.eventname + '] ';
    //
    global.pg.connect
    (
        global.cs,
        function (err, client, done) 
        {
            if (!err) 
            {
                var tx = new global.pgtx(client);
                tx.begin
                (
                    function (err) 
                    {
                        if (!err) 
                        {
                            doSavePermissionTemplate(tx, world).then
                            (
                                function (result) 
                                {
                                    tx.commit
                                    (
                                        function (err) 
                                        {
                                            if (!err) 
                                            {
                                                done();
                                                world.spark.emit
                                                (
                                                    world.eventname, 
                                                    { 
                                                        rc: global.errcode_none,
                                                        msg: global.text_success,
                                                        permissiontemplateid: result.permissiontemplateid,
                                                        // datecreated: result.datecreated,
                                                        // usercreated: result.usercreated,
                                                        pdata: world.pdata
                                                    }
                                                );
                                                global.pr.sendToRoomExcept
                                                (
                                                    global.custchannelprefix + world.cn.custid, 
                                                    'permissiontemplatesaved', 
                                                    { 
                                                        permissiontemplateid: result.permissiontemplateid,
                                                        // datecreated: result.datecreated,
                                                        // usercreated: result.usercreated
                                                    }, 
                                                    world.spark.id
                                                );
                                            }
                                            else 
                                            {
                                                tx.rollback
                                                (
                                                    function (ignore) 
                                                    {
                                                        done();
                                                        msg += global.text_tx + ' ' + err.message;
                                                        global.log.error({ savepermissiontemplate: true }, msg);
                                                        world.spark.emit(global.eventerror, { rc: global.errcode_dberr, msg: msg, pdata: world.pdata });
                                                    }
                                                );
                                            }
                                        }
                                    );
                                }
                            ).then
                            (
                                null,
                                function (err) 
                                {
                                    tx.rollback
                                    (
                                        function (ignore) 
                                        {
                                            done();

                                            msg += global.text_generalexception + ' ' + err.message;
                                            global.log.error({ savepermissiontemplate: true }, msg);
                                            world.spark.emit(global.eventerror, { rc: global.errcode_fatal, msg: msg, pdata: world.pdata });
                                        }
                                    );
                                }
                            );
                        } 
                        else 
                        {
                            done();
                            msg += global.text_notxstart + ' ' + err.message;
                            global.log.error({ savepermissiontemplate: true }, msg);
                            world.spark.emit(global.eventerror, { rc: global.errcode_dberr, msg: msg, pdata: world.pdata });
                        }
                    }
                );
            } 
            else 
            {
                global.log.error({ savepermissiontemplate: true }, global.text_nodbconnection);
                world.spark.emit(global.eventerror, { rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata });
            }
        }
    );

}




// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.doNewPermissionTemplate = doNewPermissionTemplate;



// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.LoadPermissionTemplate = LoadPermissionTemplate;
module.exports.NewPermissionTemplate = NewPermissionTemplate;
module.exports.ListPermissionTemplates = ListPermissionTemplates;
module.exports.SavePermissionTemplate = SavePermissionTemplate;