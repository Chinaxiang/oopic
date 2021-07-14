var version = chrome.runtime.getManifest().version;
var imageData = localStorage.imageData ? JSON.parse(localStorage.imageData) : [];
var blob = localStorage.webImg;
if (blob) {
    localStorage.removeItem('webImg');
    window.close();
}
// 上传地址
var upUrl = 'https://sm.ms/api/v2/upload';

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

function urlsafeBase64Encode(str) {
    var words = CryptoJS.enc.Utf8.parse(str);
    var encoded = CryptoJS.enc.Base64.stringify(words);
    return base64ToUrlSafe(encoded);
}

function base64ToUrlSafe(v) {
    return v.replace(/\//g, '_').replace(/\+/g, '-');
}

function random_string(len) {
    len = len || 32;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function get_suffix(filename) {
    pos = filename.lastIndexOf('.');
    suffix = '.png';
    if (pos != -1) {
        suffix = filename.substring(pos);
    }
    return suffix;
}

var Pb = Pb || {};
Pb.prototype = {
    options_url: chrome.extension.getURL('option.html'),
    is_batch: $(this).data('batch') | 0,
    xhr_arr: [],
    pic_num: 0,

    init: function () {
        $(".optionPage").click(function (event) {
            event.preventDefault();
            chrome.tabs.create({ url: Pb.prototype.options_url });
        });
        $("#help").click(function (event) {
            event.preventDefault();
            $('#qrcode').show();
            $('#main').hide();
        });
        $("#qrcode img").click(function (event) {
            event.preventDefault();
            $('#qrcode').hide();
            $('#main').show();
        });
        $(".btn-batch").on("click", function () {
            Pb.prototype.toggleBatch();
        });
        $('body').on('mouseenter', '.clicker', function () {
            var img_url = $(this).parent().nextAll().find('#res_img').data('url');

            if (img_url != '' && img_url != undefined && $(this).attr('data-url') != 1) {
                $(this).prop('src', img_url);
                $(this).attr('data-url', 1);
            }
        }).on("click", '.clicker', function () {
            $('#input').trigger('click');
        });
        $(".btn-copy,.btn-batchcopy").hover(
            function () {
                $(this).removeAttr('data-tooltip');
            },
            function () {
                $(this).blur();
            }
        );
        $(".btn-copy").on("click", function (event) {
            event.preventDefault();
            $(this).prev().select();
            var dataToCpy = $(this).prev().val();
            document.execCommand('copy');
            $(this).attr("data-tooltip", "复制成功");
            document.getSelection().removeAllRanges();
        });
        $(".batch-model").on('mouseenter', '.batch-img', function () {
            var img_url = $(this).nextAll().find('.batch-url').data('url');

            if (img_url != '' && img_url != undefined && $(this).attr('data-url') != 1) {
                $(this).prop('src', img_url);
                $(this).attr('data-url', 1);
            }
        });
        $(".batch-model").on('mouseenter', '.batch-url', function () {
            $(this).parent().removeAttr('data-tooltip');
        }).on('mouseleave', '.batch-url', function () {
            $(this).blur();
        });
        $(".batch-model").on('click', '.fancybox-close', function () {
            if ($(this).parent().parent().children().length == 1) {
                $(this).parent().remove();
                Pb.prototype.clearData();
            } else {
                $(this).parent().remove();
            }
        });
        $(".batch-model").on('focus', '.batch-url', function (event) {
            event.preventDefault();
            $(this).select();
            var dataToCpy = $(this).val();
            document.execCommand('copy');
            $(this).parent().attr("data-tooltip", "复制成功");
            document.getSelection().removeAllRanges();
        });
        $(".res").hover(
            function () {
                $(this).select();
            },
            function () {
                $(this).blur();
            }
        );
        $(".btn-format").on("click", function () {
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');
            if (Pb.prototype.is_batch > 0) {
                var img_length = $('.batch-model img').length;
                for (var i = 0; i < img_length; i++) {
                    Pb.prototype.changePicFormat($('#res' + i).data('url'), i);
                }
            } else {
                Pb.prototype.changePicFormat($('#res_img').data('url'));
            }
        });
        $('.btn-batchcopy').click(function () {
            var url_list = [];
            $('.batch-img').each(function () {
                url_list.push($(this).nextAll().find('.batch-url').val());
            });
            var text = url_list.join('\n');
            var copyFrom = $('<textarea id="copyFrom"/>');
            copyFrom.css({
                position: "absolute",
                left: "-1000px",
                top: "-1000px",
            });
            copyFrom.text(text);
            $('body').append(copyFrom);
            copyFrom.select();
            document.execCommand('copy');
            $(copyFrom).remove();
            $(this).attr("data-tooltip", "复制成功");
        });

        $("body").on({
            dragleave: function (e) {
                e.preventDefault();
            },
            drop: function (e) {
                e.preventDefault();
            },
            dragenter: function (e) {
                e.preventDefault();
            },
            dragover: function (e) {
                e.preventDefault();
            }
        });
        $(document).keydown(function (event) {
            if (event.keyCode == 27) {
                localStorage.removeItem('webImg');
                window.close();
            }
        });
        $('#input').change(function (event) {
            localStorage.removeItem('webImg');
            event.preventDefault();
            var filesToUpload = document.getElementById('input').files;
            var img_files = [];
            for (var i = 0; i < filesToUpload.length; i++) {
                var file = filesToUpload[i];
                if (/image\/\w+/.test(file.type) && file != "undefined") {
                    img_files.push(file);
                }
            }
            Pb.prototype.getImageFile(img_files, filesToUpload.length);
        });
        $("body").on('drop', function (e) {
            localStorage.removeItem('webImg');
            e.preventDefault();
            var fileList = e.originalEvent.dataTransfer.files;
            var img_files = [];
            for (var i = 0; i < fileList.length; i++) {
                var file = fileList[i];
                if (fileList[0].type.indexOf('image') !== -1 && fileList[0] != "undefined") {
                    img_files.push(file);
                }
            }
            Pb.prototype.getImageFile(img_files, fileList.length);
        });
        $("#res_img").on("paste", function (e) {
            localStorage.removeItem('webImg');
            var oe = e.originalEvent;
            var clipboardData, items, item;
            if (oe && (clipboardData = oe.clipboardData) && (items = clipboardData.items)) {
                var b = false;
                var img_files = [];
                for (var i = 0, l = items.length; i < l; i++) {
                    if ((item = items[i]) && item.kind == 'file' && item.type.match(/^image\//i)) {
                        b = true;
                        img_files.push(item.getAsFile());
                    }
                }
                Pb.prototype.getImageFile(img_files, items.length);
                if (b) return false;
            }
        });
    },
    uploadFinishEvent: function () {
        if (Pb.prototype.is_batch) {
            $('#single-progress').css('display', 'none');
            $('.file-info').css('display', 'none');
            $('.batch-model .clicker').css('border', 'none').css('background-color', 'transparent').css('box-shadow', 'none');
        } else {
            $('#single-progress').css('display', 'inline-block');
            $('.single-model #uploadPlaceHolder').prop('src', '1x1.png');
            $('.single-model .clicker').css('border', 'none').css('background-color', 'transparent').css('box-shadow', 'none');
        }
    },
    toggleBatch: function (flag) {
        if (arguments.length > 0 && !isNaN(flag)) {
            var batch = parseInt(flag) > 0 ? 1 : 0;
        } else {
            var batch = $(".btn-batch").data('batch') | 0;
            batch = batch > 0 ? 0 : 1;
        }
        if (batch == 1) {
            Pb.prototype.is_batch = batch;
            $(".btn-batch").text('返回默认');
            $(".btn-batch").data('batch', batch);
            $('.single-model').hide();
            $('.btn-batchcopy').parent().css('display', 'block');
            $('.btn-format').parent().css('display', 'inline-block');
            $('.batch-model').show();
        } else {
            Pb.prototype.is_batch = batch;
            $(".btn-batch").text('批量模式');
            $(".btn-batch").data('batch', batch);
            $('.single-model').show();
            $('.btn-batchcopy').parent().css('display', 'none');
            $('.btn-format').parent().css('display', 'none');
            $('.batch-model').hide();
        }
    },
    changePicFormat: function (img_url, i) {
        if (Pb.prototype.is_batch > 0 && arguments.length > 1) {
            $('#res' + i).data('url', img_url);
            var url_format = parseInt($(".btn-format").parent().children(".active").prop("value"));
            switch (url_format) {
                case 1:
                    $('#res' + i).val(img_url);
                    break;
                case 2:
                    $('#res' + i).val('<img src="' + img_url + '"/>');
                    break;
                case 3:
                    $('#res' + i).val('[IMG]' + img_url + '[/IMG]');
                    break;
                case 4:
                    $('#res' + i).val('![](' + img_url + ')');
                    break;
                default:
                    $('#res' + i).val(img_url);
                    break;
            }
        } else {
            $('#res_img').data('url', img_url);
            $('#res_img').val(img_url);
            $('#res_html').val('<img src="' + img_url + '"/>');
            $('#res_ubb').val('[IMG]' + img_url + '[/IMG]');
            $('#res_md').val('![](' + img_url + ')');
        }
        return img_url;
    },
    saveUrlToLocal: function (image, i) {
        if (Pb.prototype.is_batch > 0 && arguments.length > 1) {
            $('#res' + i).data('url', image);
        } else {
            $('#res_img').data('url', image);
            $(".loader-wrap").fadeOut("fast");
            $(".btn-copy").removeClass("disabled");
        }
        imageData.push({
            date: (new Date()).getTime(),
            imgsrc: image
        });
        localStorage.imageData = JSON.stringify(imageData);
    },
    batchDisplay: function (n) {
        var str = '';
        for (var i = 0; i < n; i++) {
            str = str + '\
                        <div class="col-xs-4 col-md-4 col-lg-4">\
                            <div class="fancybox-close"></div>\
                            <img src="placeholder-batch.png" class="clicker dragger batch-img" id="pic' + i + '">\
                            <div class="progress">\
                                <div class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 20%">\
                                    <span class="sr-only">20% Complete</span>\
                                </div>\
                            </div>\
                            <div class="input-append" style="display: none">\
                                <span id="span' + i + '">\
                                <input class="res col-xs-12 batch-url" id="res' + i + '" value="" spellcheck="false" readonly="true"/>\
                                </span>\
                            </div>\
                        </div>';
        }
        $('.batch-model').html(str);
    },
    toggleBtn: function (flag) {
        if (arguments.length > 0 && !isNaN(flag)) {
            var btn = parseInt(flag) > 0 ? 1 : 0;
        } else {
            var btn = $('.btn-batch').attr('disabled') != 'disabled' ? 0 : 1;
        }
        if (btn === 0) {
            $('.btn-batch').attr('disabled', 'disabled');
            $('.btn-batchcopy').attr('disabled', 'disabled');
        } else {
            $('.btn-batch').removeAttr('disabled');
            $('.btn-batchcopy').removeAttr('disabled', 'disabled');
        }
    },
    getImageFile: function (img_files, flag) {
        if (img_files.length > 0 && ($('.clicker:first').attr('src') != 'placeholder.png' || $('.clicker:last').attr('src') != 'placeholder-batch.png')) {
            Pb.prototype.clearData();
        }
        if (img_files.length > 1 || (img_files.length > 0 && Pb.prototype.is_batch > 0)) {
            Pb.prototype.toggleBatch(1);
            Pb.prototype.toggleBtn(0);
            Pb.prototype.batchDisplay(img_files.length);
        }
        for (var i = 0; i < img_files.length; i++) {
            var file = img_files[i];
            Pb.prototype.previewAndUpload(file, i);
        }
        if (img_files.length < 1 && flag) {
            swal("您拖的不是图片~");
            return false;
        }
    },
    previewAndUpload: function (file, i) {
        Pb.prototype.uploadFinishEvent();
        $(".loader-wrap").show();
        var reader = new FileReader();

        var fileName = file.name;
        if (!fileName) {
            fileName = 'blob.png';
        }
        var renameFile = new File([file], fileName, { type: file.type });

        reader.readAsDataURL(file);
        reader.onload = function (e) {
            if (Pb.prototype.is_batch) {
                $('#pic' + i).prop('src', '1x1.png');
                $('#pic' + i).css('background-image', 'url(' + this.result + ')');
                $('#pic' + i).css('background-position', 'center');
            } else {
                $('.single-model img').prop('src', '1x1.png');
                $('.single-model img').css('background-image', 'url(' + this.result + ')');
                $('.single-model img').css('background-position', 'center');
                $('.file-info').css('display', 'inline-block');
                if (file.name && file.name.length > 30) {
                    $("#fileName").text(file.name.substring(0, 8) + "..." + file.name.substring(file.name.length - 8, file.name.length));
                } else if (file.name) {
                    $("#fileName").text(file.name);
                } else {
                    $("#fileName").text(fileName);
                }
                $("#fileSize").text((e.total / 1024).toFixed(2) + " kb");
            }
        };
        reader.onloadend = function (e) {
            $(".loader-wrap").fadeOut("fast");

            var data = Pb.prototype.buildForm(renameFile);

            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (event) { Pb.prototype.updateProgress(event, i) });

            Pb.prototype.xhr_arr.push(xhr);
            Pb.prototype.pic_num++;

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var resText = xhr.responseText;
                        var image_url = Pb.prototype.parseRet(resText, data);
                        try {
                            Pb.prototype.changePicFormat(image_url, i);
                            Pb.prototype.saveUrlToLocal(image_url, i);
                            if (--Pb.prototype.pic_num == 0) {
                                Pb.prototype.toggleBtn(1);
                            }
                            $('#pic' + i).nextAll('.progress').hide();
                            $('#pic' + i).nextAll('.input-append').show();
                            return true;
                        } catch (e) {
                            Pb.prototype.uploadFinishEvent();
                            return;
                        }
                    } else {
                        swal("图片上传失败...");
                    }
                }
            };
            xhr.open('POST', upUrl);
            xhr.send(data);
        };
    },
    updateProgress: function (evt, i) {
        if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            $('#pic' + i).nextAll('.progress').children('.progress-bar').css('width', percentComplete * 100 + "%");
            if ($('.single-model:visible')[0]) {
                $('#single-progress').children('.progress-bar').css('width', percentComplete * 100 + "%");
            }
        } else {
            $('#pic' + i).nextAll('.progress').children('.progress-bar').css('width', "60%");
        }
    },
    clearData: function () {
        $('.clicker').removeAttr('style');
        Pb.prototype.xhr_arr = [];
        $('.batch-model').html('<div><img src="placeholder-batch.png" class="dragger clicker"></div>');
        $('.single-model[class^=col-xs-4] img').prop('src', 'placeholder.png');
        $('.single-model[class^=col-xs-4] img').attr('data-url', 0);
        $('.res').each(function () {
            $(this).val('');
            if ($(this).data('url') != undefined) {
                $(this).data('url', '');
            }
        });
        $('.btn-copy').each(function () {
            $(this).addClass('disabled');
        });
    },
    imageToBase64: function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result, xhr.response);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }
};

function parseRet(text, formData) {
    var res = JSON.parse(text);
    var image_url = res.data ? res.data.url : res.images;
    return image_url;
}

function buildForm(file) {
    var data = new FormData();
    data.append('smfile', file);
    return data;
}


Pb.prototype.buildForm = buildForm;
Pb.prototype.parseRet = parseRet;

window.addEventListener('storage', fresh, false);

var oldScript = localStorage.script;

function fresh() {
    var str = localStorage.script;
    if (str && str != oldScript) {
        window.location.reload();
    }
}

function loadScript() {
    var str = localStorage.script;
    if (str && str != '') {
        var obj = JSON.parse(str);
        var upType = obj.type;
        $('#statusBadge').text(upType);
        eval(obj.content);
        Pb.prototype.buildForm = buildForm;
        Pb.prototype.parseRet = parseRet;
    }
}

loadScript();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.message) {
        case 'uploadImageDataByURL':
            var imageURL = request.url;
            if (imageURL) {
                Pb.prototype.imageToBase64(imageURL, (base64, data) => {
                    localStorage.webImg = 1;
                    Pb.prototype.getImageFile([data], 1);
                });
            }
            break;
    }
});

$(function () {
    my = Pb.prototype;
    my.init();
});
