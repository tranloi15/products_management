tinymce.init({
    selector: "textarea.textarea-mce",
    plugins: "image",
    file_picker_callback: function (cb, value, meta) {
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');

        input.onchange = function () {
            var file = this.files[0];

            var reader = new FileReader();
            reader.onload = function () {
                var id = 'blobid' + (new Date()).getTime();
                var blobCache = tinymce.activeEditor.editorUpload.blobCache;
                var base64 = reader.result.split(',')[1];
                var blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                cb(blobInfo.blobUri(), { title: file.name });
            };
            reader.readAsDataURL(file);
        };
    },
    color_map: [
        '000000', 'Black',
        '808080', 'Gray',
        'FFFFFF', 'White',
        'FF0000', 'Red',
        'FFFF00', 'Yellow',
        '008000', 'Green',
        '0000FF', 'Blue',
        '800080', 'Purple',
        'FFC0CB', 'Pink',
        'FFA500', 'Orange'
    ]
});