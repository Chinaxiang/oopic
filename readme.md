## 🚀 喔喔图床

作为一名IT民工，平时喜欢写一些文档，博客，并且比较喜欢 Markdown 语法，但一直以来比较困扰的一个问题就是插入图片麻烦，因为文档可能会放置到各个网站中，如何保证图片能够正常显示是一件头痛的事情。另外，图片上传要足够方便，正好 Chrome 插件能完全满足需求。

### 特点

- 支持点选/拖拽/本地粘贴3种方式上传图片至图床
- 支持右键上传网页图片
- 支持批量上传
- 可生成图片链接,HTML,UBB和Markdown四种格式
- 历史浏览
- 支持配置多种存储后端

好用记得给点好评哟。

### 默认存储

默认采用 SM.MS 图床，支持免费存储，但会有部分限制。

- 大小5M内
- 每分钟，每小时，每天，每周，每月有一定数量的限制，应该足够用


### 图壳

图壳，免费图床，请阅读须知：https://imgkr.com/

图壳上传校验Referer, Chrome现在禁用了ajax referer头的更改，所以需要配置一个代理服务器进行中转。

[图壳配置本地代理](https://mp.weixin.qq.com/s/BB41sswbMrQfreitQPDzjA)

> curl 模拟

```
curl -X POST -H "Referer: https://imgkr.com/" -F 'file=@qrcode.jpg' https://imgkr.com/api/files/upload
```

> nginx 配置

```
location /api/files/upload {
    proxy_set_header Host imgkr.com;
    proxy_set_header Referer https://imgkr.com/;
    proxy_set_header Origin https://imgkr.com/;
    proxy_pass https://imgkr.com;
}
```

### 七牛云存储

现在的bucket需要绑定自己的域名，域名还需要备案，比较难搞，建议直接上阿里云OSS.

### 阿里云OSS

采用PostObject模式：

https://help.aliyun.com/document_detail/31988.htm

阿里云OSS需要绑定自定义域名后才能浏览器直接预览，否则会弹出下载，不过不影响作为图床的使用。

### 自定义扩展

有一定开发能力的可以根据其他存储进行扩展，提供如下资料：

- upUrl: 上传接口完全路径，POST 表单上传
- buildForm(file): 构建表单参数方法
- parseRet(text, formData): 解析ajax响应内容，返回图片的完全访问路径

```
upUrl = 'http://yoururl';
function buildForm(file) {
    var data = new FormData();
    data.append('file', file);
    return data;
}
function parseRet(text, formData) {
    var res = JSON.parse(text);
    var image_url = res.data;
    return image_url;
}
```
