var storageData = localStorage.imageData ? JSON.parse(localStorage.imageData) : [];

Date.prototype.format = function (format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}

function buildHtml() {
    var html = '';
    var imageitemtemplate = $('#image-item-template').html();
    for (var i = 0; i < storageData.length; i++) {
        var item = storageData[i];
        var timestamp = item.date;
        var src = item.imgsrc;
        var d = new Date(timestamp);
        html += imageitemtemplate
            .replace(/{{imgsrcthumb}}/g, src)
            .replace(/{{date}}/g, d.format('yyyy-MM-dd h:m'))
            .replace(/{{d}}/g, timestamp)
            .replace(/{{imgsrc}}/g, src);
    }
    $('.box').html('<h5>上传历史</h5>' + html);
}

function removeImgItem(d) {
    for (var i = 0; i < storageData.length; i++) {
        var item = storageData[i];
        var timestamp = item.date;
        if (timestamp == d) {
            storageData.splice(i, 1);
            localStorage.imageData = JSON.stringify(storageData);
            return;
        }
    }
}

$(document).ready(function () {
    var version = chrome.runtime.getManifest().version;
    $(".current_version").text(version);

    $(document).on('click', '.fancybox-title', function () {
        var copyFrom = $('<textarea id="copyFrom"/>');
        copyFrom.css({
            position: "absolute",
            left: "-1000px",
            top: "-1000px",
        });
        copyFrom.text($(this).text());
        $('body').append(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        $(copyFrom).remove();
        swal({
            title: "复制成功"
        });
    });

    $('.close').on('click', function (event) {
        event.preventDefault();
        window.close();
    });

    $('.donate').on('click', function () {
        swal({
            title: "扫码捐助",
            text: '<img width="200" height="200" src="http://laijuba.qiniudn.com/2019/08/10/Fsw6dnEyfF2CbnNGcTiI_kLG3ijZ">' +
                '<span style="margin:10px;">或</span>' +
                '<img width="200" height="200" src="http://laijuba.qiniudn.com/2019/08/10/FmztFFOptTjQ6whtcsXhxBEiKRNx">',
            html: true
        });
    });

    buildHtml();

    $(".fancybox").fancybox({
        maxWidth: 1000,
        openEffect: 'fade',
        closeEffect: 'elastic',
        helpers: {
            title: {
                type: 'inside'
            }
        }
    });

    $('.page-content').bind('contextmenu', function (e) {
        e.preventDefault();
        var d = $(this).attr("d");
        var div = $(this).parent();
        swal({
            title: "确定要删除吗?",
            text: "",
            type: "error",
            showCancelButton: true,
            cancelButtonText: "取消",
            confirmButtonColor: "#D9534F",
            confirmButtonText: "删除"
        }, function () {
            div.fadeOut("fast");
            div.remove();
            removeImgItem(d);
        });
    });

    $('#typeSelect').on('change', function () {
        var value = $(this).val();
        $('#content').val(scripts[value]);
    });

    var scripts = {};
    scripts['阿里云OSS'] = "upUrl = 'https://your-bucket-url/';\n"
        + "var accessKey = 'your ak';\n"
        + "var secretKey = 'your sk';\n"
        + "function parseRet(text, formData) {\n"
        + "    return upUrl + formData.get('key');\n"
        + "}\n"
        + "function buildForm(file) {\n"
        + "    var policyText = {\n"
        + "        \"expiration\": new Date((Date.now() + 300000)).toISOString(),\n"
        + "        \"conditions\": [\n"
        + "            [\"content-length-range\", 0, 104857600]\n"
        + "        ]\n"
        + "    };\n"
        + "    var policyBase64 = Base64.encode(JSON.stringify(policyText));\n"
        + "    var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(policyBase64, secretKey));\n"
        + "    var data = new FormData();\n"
        + "    var key = new Date().format('yyyy/MM/dd/h/') + random_string(6) + get_suffix(file.name);\n"
        + "    data.append('key', key);\n"
        + "    data.append('policy', policyBase64);\n"
        + "    data.append('OSSAccessKeyId', accessKey);\n"
        + "    data.append('success_action_status', '200');\n"
        + "    data.append('signature', signature);\n"
        + "    data.append('file', file);\n"
        + "    return data;\n"
        + "}";
    scripts['七牛云OSS'] = "upUrl = 'https://upload.qiniup.com/';\n"
        + "var accessKey = 'your ak';\n"
        + "var secretKey = 'your sk';\n"
        + "var bucketHost = 'http://your-bucket-domain/';\n"
        + "function parseRet(text, formData) {\n"
        + "    var res = JSON.parse(text);\n"
        + "    var image_url = bucketHost + res.key;\n"
        + "    return image_url;\n"
        + "}\n"
        + "function buildForm(file) {\n"
        + "    var fileName = file.name;\n"
        + "    var flags = {\n"
        + "        deadline: Math.floor(Date.now() / 1000) + 300,\n"
        + "        scope: \"laijuba\",\n"
        + "        saveKey: \"${year}/${mon}/${day}/$(etag)\" + get_suffix(fileName)\n"
        + "    };\n"
        + "    var encodedFlags = urlsafeBase64Encode(JSON.stringify(flags));\n"
        + "    var encoded = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(encodedFlags, secretKey));\n"
        + "    var encodedSign = base64ToUrlSafe(encoded);\n"
        + "    var uploadToken = accessKey + ':' + encodedSign + ':' + encodedFlags;\n"
        + "    var data = new FormData();\n"
        + "    data.append('token', uploadToken);\n"
        + "    data.append('file', file);\n"
        + "    return data;\n"
        + "}";
    scripts['自定义'] = "upUrl = 'http://yoururl';\n"
        + "function buildForm(file) {\n"
        + "    var data = new FormData();\n"
        + "    data.append('file', file);\n"
        + "    return data;\n"
        + "}\n"
        + "function parseRet(text, formData) {\n"
        + "    var res = JSON.parse(text);\n"
        + "    var image_url = res.data;\n"
        + "    return image_url;\n"
        + "}";


    $('#change').on('click', function () {
        var typeSelect = $('#typeSelect').val();
        var content = $('#content').val();
        var script = {};
        script.type = typeSelect;
        script.content = content;
        localStorage.script = JSON.stringify(script);

        scripts[typeSelect] = content;
    });

    function loadScript() {
        var str = localStorage.script;
        if (str && str != '') {
            var obj = JSON.parse(str);
            $('#typeSelect').val(obj.type);
            $('#content').val(obj.content);
            scripts[obj.type] = obj.content;
        }
    }

    loadScript();
});
