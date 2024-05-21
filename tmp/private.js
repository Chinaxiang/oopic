// 个人使用的配置暂存，方便查看
// 大家可以忽略或者参考

// 七牛云存储配置临时存放
upUrl = 'https://upload.qiniup.com/';
var accessKey = 'ak';
var secretKey = 'sk';
var bucketHost = 'http://laijuba.qiniudn.com/';
function parseRet(text, formData) {
    var res = JSON.parse(text);
    var image_url = bucketHost + res.key;
    return image_url;
}
function buildForm(file) {
    var fileName = file.name;
    var flags = {
        deadline: Math.floor(Date.now() / 1000) + 300,
        scope: "laijuba",
        saveKey: "${year}/${mon}/${day}/$(etag)" + get_suffix(fileName)
    };
    var encodedFlags = urlsafeBase64Encode(JSON.stringify(flags));
    var encoded = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(encodedFlags, secretKey));
    var encodedSign = base64ToUrlSafe(encoded);
    var uploadToken = accessKey + ':' + encodedSign + ':' + encodedFlags;
    var data = new FormData();
    data.append('token', uploadToken);
    data.append('file', file);
    return data;
}

// 阿里云OSS配置临时存放
upUrl = 'https://oosnail.oss-cn-hangzhou.aliyuncs.com/';
var accessKey = 'ak';
var secretKey = 'sk';
function parseRet(text, formData) {
    return upUrl + formData.get('key');
}
function buildForm(file) {
    var policyText = {
        "expiration": new Date((Date.now() + 300000)).toISOString(),
        "conditions": [
            ["content-length-range", 0, 104857600]
        ]
    };
    var policyBase64 = Base64.encode(JSON.stringify(policyText));
    var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(policyBase64, secretKey));
    var data = new FormData();
    var key = new Date().format('yyyy/MM/dd/h/') + random_string(9) + get_suffix(file.name);
    data.append('key', key);
    data.append('policy', policyBase64);
    data.append('OSSAccessKeyId', accessKey);
    data.append('success_action_status', '200');
    data.append('signature', signature);
    data.append('file', file);
    return data;
}