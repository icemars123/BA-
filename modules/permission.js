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
                'insert into permissiontemplatedetails (name,canvieworders,cancreateorders,canviewinvoices,cancreateinvoices,canviewinventory,cancreateinventory,canviewpayroll,cancreatepayroll,canviewproducts,cancreateproducts,canviewclients,cancreateclients,canviewcodes,cancreatecodes,canviewusers,cancreateusers,canviewbuilds,cancreatebuilds,canviewtemplates,cancreatetemplates,canviewbanking,cancreatebanking,canviewpurchasing,cancreatepurchasing,canviewalerts,cancreatealerts,canviewdashboard,cancreatedashboard,userscreated_id,customers_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31) returning id', 
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
                    world.cancreatedashboard,

                    world.cn.userid,
                    world.cn.custid
                ],
                function (err, result) 
                {
                    if (!err) 
                    {
                        var permissiontemplateid = result.rows[0].id;

                        tx.query
                        (
                            'select p1.datecreated,u1.name usercreated from permissiontemplatedetails p1 left join users u1 on (p1.userscreated_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
                            [
                                world.cn.custid,
                                __.sanitiseAsBigInt(permissiontemplateid)
                            ],
                            function (err, result) 
                            {
                                if (!err) 
                                {
                                    var pc = result.rows[0];

                                    resolve
                                    (
                                        {
                                            permissiontemplateid: permissiontemplateid,
                                            datecreated: global.moment(pc.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                                            usercreated: pc.usercreated 
                                        }
                                    )
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
                'cancreatedashboard=$29, ' +
                'datemodified=now(), ' +
                'usersmodified_id=$30 ' +
                'where customers_id=$31 and id=$32 and dateexpired is null',
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
                    world.cancreatedashboard,

                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.permissiontemplateid)
                ],
                function (err, result) 
                {
                    if (!err) 
                    {
                        tx.query
                        (
                            'select ' + 
                            'p1.datemodified,u1.name ' +
                            'from ' + 
                            'permissiontemplatedetails p1 left join users u1 on (p1.usersmodified_id=u1.id) ' +
                            'where ' +
                            'p1.customers_id=$1 and p1.id=$2',
                            [
                                world.cn.custid,
                                __.sanitiseAsBigInt(world.permissiontemplateid)
                            ],
                            function (err, result) 
                            {
                                if (!err) 
                                {
                                    resolve
                                    (
                                        {
                                            datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'),
                                            usermodified: result.rows[0].name
                                        }
                                    );
                                } 
                                else
                                    reject(err); 
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

function doExpirePermissionTemplate(tx, world) 
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
                'dateexpired=now(),' + 
                'usersexpired_id=$1 ' + 
                'where ' +
                'customers_id=$2 and id=$3 and dateexpired is null',
                [
                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.permissiontemplateid)
                ],
                function (err, result) 
                {
                    if (!err) 
                    {
                        tx.query
                        (
                            'select ' + 
                            'p1.permissiontemplatedetails_id permissiontemplateid,' +
                            'p1.dateexpired,' +
                            'u1.name ' + 
                            'from ' + 
                            'permissiontemplatedetails p1 left join users u1 on (p1.usersmodified_id=u1.id) ' + 
                            'where ' + 
                            'p1.customers_id=$1 and p1.id=$2',
                            [
                                world.cn.custid,
                                __.sanitiseAsBigInt(world.permissiontemplateid)
                            ],
                            function (err, result) 
                            {
                                if (!err)
                                    resolve
                                    (
                                        { 
                                            permissiontemplateid: result.rows[0].permissiontemplateid, 
                                            dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), 
                                            userexpired: result.rows[0].name 
                                        }
                                    );
                                else
                                    reject(err);
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

function doExpirePermissionTemplateStep1(tx, world) 
{
    var promise = new global.rsvp.Promise
    (
        function (resolve, reject) 
        {
            if (!world.cascade) 
            {
                tx.query
                (
                    'select id from permissiontemplatedetails where '
                );
            } 
            else 
                resolve({permissiontemplateid: world.permissiontemplateid});
        }
    );
    return promise;
}

function doExpirePermissionTemplateStep2(tx, world) 
{
    var promise = new global.rsvp.Promise
    (
        function (resolve, reject) 
        {
            tx.query
            (

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
                    'p1.id,' +
                    'p1.name,' + 
                    'p1.canvieworders,' +
                    'p1.cancreateorders,' +
                    'p1.canviewinvoices,' +
                    'p1.cancreateinvoices,' + 
                    'p1.canviewinventory,' + 
                    'p1.cancreateinventory,' + 
                    'p1.canviewpayroll,' + 
                    'p1.cancreatepayroll,' + 
                    'p1.canviewproducts,' + 
                    'p1.cancreateproducts,' + 
                    'p1.canviewclients,' + 
                    'p1.cancreateclients,' + 
                    'p1.canviewcodes,' + 
                    'p1.cancreatecodes,' + 
                    'p1.canviewusers,' + 
                    'p1.cancreateusers,' + 
                    'p1.canviewbuilds,' +
                    'p1.cancreatebuilds,' + 
                    'p1.canviewtemplates,' +
                    'p1.cancreatetemplates,' + 
                    'p1.canviewbanking,' + 
                    'p1.cancreatebanking,' + 
                    'p1.canviewpurchasing,' + 
                    'p1.cancreatepurchasing,' + 
                    'p1.canviewalerts,' + 
                    'p1.cancreatealerts,' + 
                    'p1.canviewdashboard,' + 
                    'p1.cancreatedashboard, ' +
                    'p1.datecreated, ' +
                    'p1.datemodified, ' +
                    'u1.name usercreated, ' +
                    'u2.name usermodified ' +
                    'from ' +
                    'permissiontemplatedetails p1 left join permissiontemplatedetails p2 on (p1.permissiontemplatedetails_id=p2.id) ' + 
                    '                             left join users u1 on (p1.userscreated_id=u1.id) ' +
                    '                             left join users u2 on (p1.usersmodified_id=u2.id) ' +
                    'where ' +
                    'p1.customers_id=$1 and p1.id=$2',
                    [
                        world.cn.custid,
                        __.sanitiseAsBigInt(world.permissiontemplateid)
                    ],
                    function (err, result) 
                    {
                        done();

                        if (!err) 
                        {
                            result.rows.forEach
                            (
                                function (p) 
                                {
                                    if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified)) 
                                        p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                                    p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                                }
                            );

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
                                                        datecreated: result.datecreated,
                                                        usercreated: result.usercreated,
                                                        pdata: world.pdata
                                                    }
                                                );
                                                global.pr.sendToRoomExcept
                                                (
                                                    global.custchannelprefix + world.cn.custid,
                                                    'permissiontemplatecreated',
                                                    {
                                                        permissiontemplateid: result.permissiontemplateid,
                                                        datecreated: result.datecreated,
                                                        usercreated: result.usercreated
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
                    'p1.id,' +
                    'p1.name,' + 
                    'p1.canvieworders,' +
                    'p1.cancreateorders,' +
                    'p1.canviewinvoices,' +
                    'p1.cancreateinvoices,' + 
                    'p1.canviewinventory,' + 
                    'p1.cancreateinventory,' + 
                    'p1.canviewpayroll,' + 
                    'p1.cancreatepayroll,' + 
                    'p1.canviewproducts,' + 
                    'p1.cancreateproducts,' + 
                    'p1.canviewclients,' + 
                    'p1.cancreateclients,' + 
                    'p1.canviewcodes,' + 
                    'p1.cancreatecodes,' + 
                    'p1.canviewusers,' + 
                    'p1.cancreateusers,' + 
                    'p1.canviewbuilds,' +
                    'p1.cancreatebuilds,' + 
                    'p1.canviewtemplates,' +
                    'p1.cancreatetemplates,' + 
                    'p1.canviewbanking,' + 
                    'p1.cancreatebanking,' + 
                    'p1.canviewpurchasing,' + 
                    'p1.cancreatepurchasing,' + 
                    'p1.canviewalerts,' + 
                    'p1.cancreatealerts,' + 
                    'p1.canviewdashboard,' + 
                    'p1.cancreatedashboard, ' +
                    'p1.datecreated,' +
                    'p1.datemodified,' +
                    'u1.name usercreated,' +
                    'u2.name usermodified ' +
                    'from ' +
                    'permissiontemplatedetails p1 left join permissiontemplatedetails p2 on (p1.permissiontemplatedetails_id=p2.id) ' + 
                    '                             left join users u1 on (p1.userscreated_id=u1.id) ' +
                    '                             left join users u2 on (p1.usersmodified_id=u2.id) ' +
                    'where ' +
                    'p1.customers_id=$1 ' +
                    'and ' +
                    'p1.dateexpired is null ',
                    [
                        world.cn.custid
                    ],
                    function (err, result) 
                    {
                        done();
                        
                        if (!err) 
                        {
                            result.rows.forEach
                            (
                                function (p) 
                                {
                                    if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                                        p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                                    p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                                }
                            );
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
                                                        datecreated: result.datecreated,
                                                        usercreated: result.usercreated,
                                                        pdata: world.pdata
                                                    }
                                                );
                                                global.pr.sendToRoomExcept
                                                (
                                                    global.custchannelprefix + world.cn.custid, 
                                                    'permissiontemplatesaved', 
                                                    { 
                                                        permissiontemplateid: result.permissiontemplateid,
                                                        datecreated: result.datecreated,
                                                        usercreated: result.usercreated
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

function ExpirePermissionTemplate(world) 
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
                            doExpirePermissionTemplate(tx, world).then
                            // (
                            //     function (ignore) 
                            //     {
                            //         return doExpirePermissionTemplateStep2(tx, world);
                            //     }
                            // ).then
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
                                                        dateexpired: result.dateexpired, 
                                                        userexpired: result.userexpired, 
                                                        pdata: world.pdata 
                                                    }
                                                );
                                                global.pr.sendToRoomExcept
                                                (
                                                    global.custchannelprefix + world.cn.custid, 
                                                    'permissiontemplateexpired', 
                                                    { 
                                                        permissiontemplateid: result.permissiontemplateid,
                                                        dateexpired: result.dateexpired, 
                                                        userexpired: result.userexpired 
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
                                                        global.log.error({ expirepermissiontemplate: true }, msg);
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
                                            global.log.error({ expirepermissiontemplate: true }, msg);
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
                            global.log.error({ expirepermissiontemplate: true }, msg);
                            world.spark.emit(global.eventerror, { rc: global.errcode_dberr, msg: msg, pdata: world.pdata });
                        }
                    }
                );
            }
            else 
            {
                global.log.error({ expirepermissiontemplate: true }, global.text_nodbconnection);
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
module.exports.ExpirePermissionTemplate = ExpirePermissionTemplate;