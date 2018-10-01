
var dzProductImages = null;

function doDZProductImages() 
{
    if (dzProductImages)
        return;

    dzProductImages = new Dropzone
    (
        '#divNewProductImageFile',
        {
            url: '/dropproductimage',
            uploadMultiple: false,
            parallelUploads: 1,
            addRemoveLinks: true,
            maxFilesize: 10,
            dictDefaultMessage: 'Drop files here to upload - description text will be added',
            init: function () 
            {
                this.on
                (
                    'sending',
                    function (file, xhr, formData) 
                    {
                        formData.append('productid', selectedProductIdImageId);
                        formData.append('uuid', uuid);
                        // TODO: Don't know why we need to use getText rather than getValue...
                        formData.append('description', $('#fldNewProductImageDescription').textbox('getText'));
                        formData.append('isthumbnail', doSwitchButtonChecked('cbNewProductImageThumbnail') ? 1 : 0);
                    }
                );

                this.on
                (
                    'success',
                    function (file, res) 
                    {
                        $('#fldNewProductImageDescription').textbox('setValue', '');
                        this.removeFile(file);
                    }
                );

                this.on
                (
                    'reset',
                    function (file, xhr, formData) 
                    {
                    }
                );
            },
            accept: function (file, done) 
            {
                if (myperms.cancreateproducts)
                    done();
                else
                    done('You don\'t have permission to add attachments');
            }
        }
    );
}
