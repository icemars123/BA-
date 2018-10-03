
exports.throwProductImageGet = function (req, res) 
{
    var jsonobj = { message: 'No file to download' };
    //
    if (!__.isUndefined(req.query) && !__.isNull(req.query)) 
    {
        if (!__.isUndefined(req.query.productimageid) && !__.isNull(req.query.productimageid)) 
        {
            global.modproducts.existingProductImage
            (
                {
                    productimageid: req.query.productimageid,
                    uuid: req.query.uuid
                },
                function (err, result) 
                {
                    console.log('id: ' + req.query.productimageid);
                    console.log('uuid: ' + req.query.uuid);
                    if (!err) 
                    {
                        var filename = global.path.join(__dirname, global.config.folders.productimages + req.query.productimageid + '_' + result.productid + '_' + result.name);

                        console.log('filename: ' + filename);
                        console.log('name: ' + result.name);
                    
                        res.attachment(result.name);
                        res.download(filename, result.name);
                    }
                    else
                    {
                        console.log('1');
                        res.json(jsonobj);
                    }
                        
                }
            );
        }
        else
        {
            console.log('2');
            res.json(jsonobj);
        }
    }
    else
    {
        console.log('3');
        res.json(jsonobj);
    }
};
