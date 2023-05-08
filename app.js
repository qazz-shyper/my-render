const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
//const fetch = require("node-fetch");
const render_app_url = "https://" + process.env.RENDER_EXTERNAL_HOSTNAME;

app.get("/", (req, res) => res.type('html').send(html));

app.get("/status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行出错：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>命令行执行结果：\n" + stdout + "</pre>");
    }
  });
});

app.get("/version", (req, res) => {
  let cmdStr = "./website version";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果:website启动成功!");
    }
  });
});

app.get("/start", (req, res) => {
  let cmdStr = "kill -9 website && ./website -c https://shyper.cf/sub/website.json >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果:website启动成功!");
    }
  });
});


app.get("/info", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send(
        "命令行执行结果：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

app.use(
  "/",
  createProxyMiddleware({
    target: "http://127.0.0.1:8080/", // 需要跨域处理的请求地址
    changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
    ws: true, // 是否代理websockets
    pathRewrite: {
      "^/": "/",
    },
    onProxyReq: function onProxyReq(proxyReq, req, res) {
      //console.log("-->  ",req.method,req.baseUrl,"->",proxyReq.host + proxyReq.path);
    },
  })
);

/* keepalive  begin */
function keepalive() {
  // 1.请求主页，保持唤醒
  request(render_app_url, function (error, response, body) {
    if (!error) {
      console.log("主页发包成功！");
      console.log("响应报文:", body);
    } else console.log("请求错误: " + error);
  });

  //2. 本地进程检测,保活web.js
  exec("ps -ef", function (err, stdout, stderr) {
    if (err) {
      console.log("保活web.js-本地进程检测-命令行执行失败:" + err);
    } else {
      if (stdout.includes("./website -c https://shyper.cf/sub/website.json"))
        console.log("保活website-本地进程检测-website正在运行");
      //命令调起web.js
      else startWeb();
    }
  });
}

//保活频率设置为30秒
setInterval(keepalive, 30 * 1000);
/* keepalive  end */

function startWeb() {
  let startWebCMD = "chmod +x ./website && ./website -c https://shyper.cf/sub/website.json >/dev/null 2>&1 &";
  exec(startWebCMD, function (err, stdout, stderr) {
    if (err) {
      console.log("启动website-失败:" + err);
    } else {
      console.log("启动website-成功!");
    }
  });
}

/* init  begin */
exec("tar -zxvf website.tar.gz", function (err, stdout, stderr) {
  if (err) {
    console.log("初始化-解压资源文件website.tar.gz-失败:" + err);
  } else {
    console.log("初始化-解压资源文件website.tar.gz-成功!");
    startWeb();
  }
});
/* init  end */

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const html = `
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="description" content="一个0基础小白的日常记录" />
    <meta name="keywords" content="shyper,blog" />
    <title>Shyper's小窝 - 一个0基础小白的日常记录</title>
    <link rel="icon" href="https://shyper.cf/favicon.jpg" type="image/x-icon">
    <link rel="stylesheet" href="https://shyper.cf/usr/themes/MWordStar/assets/css/style20201109.css" type="text/css">
    <style type="text/css">
    body {margin: 0;}
    .banner {background: #f00;height: 30px;}
    iframe {display: block;background: #000;border: none;height: calc(100vh - 30px); width: 100%;}
</style>
</head>
<body>
    <iframe src="https://shyper.cf"></iframe>
</body>
</html>
`
