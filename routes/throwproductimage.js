
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
                    if (!err) 
                    {
                        var filename = global.path.join(__dirname, global.config.folders.productimages + req.query.productimageid + '_' + result.productid + '_' + result.name);

                        res.attachment(result.name);
                        res.download(filename, result.name);
                    }
                    else
                        res.json(jsonobj);
                }
            );
        }
        else
            res.json(jsonobj);
    }
    else
        res.json(jsonobj);
};
