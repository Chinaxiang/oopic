## 🚀 喔喔图床

作为一名IT民工，平时喜欢写一些文档，博客，并且比较喜欢 Markdown 语法，但一直以来比较困扰的一个问题就是插入图片麻烦，因为文档可能会放置到各个网站中，如何保证图片能够正常显示是一件头痛的事情。另外，图片上传要足够方便，正好 Chrome 插件能完全满足需求。

### 特点

- 支持点选/拖拽/本地粘贴3种方式上传图片至图床
- 支持右键上传网页图片
- 支持批量上传
- 可生成图片链接,HTML,UBB和Markdown四种格式
- 历史浏览（仅限浏览器本地缓存，清缓存将会失效）
- 支持配置多种存储后端（默认阿里云）

好用记得给点好评哟。阔绰的小伙伴也可以打赏一下。

### 默认存储

默认采用 SM.MS 图床，支持免费存储，但会有部分限制。

- 大小5M内
- 每分钟，每小时，每天，每周，每月有一定数量的限制，应该足够用

### 阿里云OSS

采用PostObject模式：

https://help.aliyun.com/document_detail/31988.htm

阿里云OSS需要绑定自定义域名后才能浏览器直接预览，否则会弹出下载，不过不影响作为图床的使用。

### 自定义扩展

有一定开发能力的可以根据其他存储进行扩展，提供如下资料：

- upUrl: 请提供您个人服务端上传接口完全路径，POST 表单上传
- buildForm(file): 构建表单参数方法，您可以填写个人自定义字段至form表单中
- parseRet(text, formData): 解析ajax响应内容，返回图片的完全访问路径用于快速复制及历史记录

```
// 上传接口
upUrl = 'https://yoururl';
// 构建form表单数据，file表示待上传的文件
function buildForm(file) {
    var data = new FormData();
    data.append('file', file);
    return data;
}
// 返回服务端响应的图片访问链接
function parseRet(text, formData) {
    var res = JSON.parse(text);
    var image_url = res.data;
    return image_url;
}
```
