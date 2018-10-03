// TODO: Send both uuid and fguid - to make sure it's a current session and correct user..
// OR just send fguid since we can reverse lookup uuid etc from that and keeps things anonymous over the wire...
exports.dropProductImagePost = function (req, res) 
{
    var jsonobj = { message: 'Error writing file' };
    //
    if (!__.isUndefined(req.body) && !__.isNull(req.body)) 
    {
        if (!__.isUndefined(req.body.productid) && !__.isNull(req.body.productid)) 
        {
            if (!__.isUndefined(req.files) && !__.isUndefined(req.files.file)) 
            {
                global.modproducts.newProductImage
                (
                    {
                        filename: req.files.file.originalFilename,
                        productid: req.body.productid,
                        uuid: req.body.uuid,
                        description: req.body.description,
                        isthumbnail: req.body.isthumbnail,
                        mimetype: req.files.file.type,
                        size: req.files.file.size
                    },
                    function (err, id) 
                    {
                        if (!err) 
                        {
                            var filename = global.path.join(__dirname, global.doProductImageURL(req.body.productid, id, req.files.file.originalFilename, req.files.file.type));
                            //
                            global.fs.rename
                            (
                                req.files.file.path,
                                filename,
                                function (err) 
                                {
                                    if (!err) 
                                    {
                                        // Remove original file if still there...
                                        global.fs.unlink
                                        (
                                            req.files.file.path,
                                            function () 
                                            {
                                                if (!err)
                                                    jsonobj = { id: id, filename: req.files.file.originalFilename };
                                                res.json(jsonobj);
                                            }
                                        );
                                    }
                                    else
                                        res.json(jsonobj);
                                }
                            );
                        }
                        else
                            res.json(jsonobj);
                    }
                );
            }
        }
        else
            res.json({ message: 'No file to upload' });
    }
    else
        res.json({ message: 'No form to upload' });
};