tinymce.init({
    selector: 'textarea.textarea-mce',
    plugins: 'image link table lists media code preview',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | link image media table | removeformat | code preview',

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