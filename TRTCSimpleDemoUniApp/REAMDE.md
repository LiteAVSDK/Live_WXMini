本文主要介绍如何快速跑通uni-app版本的 TRTC Demo，您可以从 [Github](https://github.com/tencentyun/TRTCSDK) 上的 WXMini 目录下获取相关代码。Demo 中前三个功能项演示了三个不同的应用场景：

- 语音聊天室：纯语音交互，支持多人互动语音聊天，以及混音、混响等声音特效功能。适合在线狼人杀、在线语音直播等社交类场景。
- 双人通话：1v1视频通话，配合 [IM SDK](https://cloud.tencent.com/document/product/269/37411) 可以实现在线问诊，在线客服等需要面对面交流的沟通场景。
- 多人会议：支持多路视频通话、大小画面和屏幕分享等围绕视频会议相关的高级功能，适用于远程培训、在线教育等场景。

![](https://web.sdk.qcloud.com/trtc/miniapp/doc/zh-cn/6517a8a927130474927628457cdc27bee.jpeg)

## 前提条件
您已 [注册腾讯云](https://cloud.tencent.com/document/product/378/17985) 账号，并完成 [实名认证](https://cloud.tencent.com/document/product/378/3629)。

## 操作步骤
[](id:step1)
### 步骤1：创建新的应用
1. 登录实时音视频控制台，选择【开发辅助】>【[快速跑通Demo](https://console.cloud.tencent.com/trtc/quickstart)】。
2. 输入应用名称，例如 TestTRTC，单击【创建】。
   ![](https://web.sdk.qcloud.com/trtc/miniapp/doc/zh-cn/9b2db43594f4744b42ef74c94494ea8e.png)

[](id:step2)
### 步骤2：下载 SDK 和 Demo 源码
1. 根据实际业务需求下载 SDK 及配套的 [Demo 源码](https://github.com/tencentyun/TRTCSDK)。
2. 下载完成后，单击【已下载，下一步】。
   ![](https://web.sdk.qcloud.com/trtc/miniapp/doc/zh-cn/3b115019ddfd0866108ed1add30810d8.png)


[](id:step3)
### 步骤3：配置 Demo 工程文件
1. 进入修改配置页，根据您下载的源码包，选择相应的开发环境。
2. 找到并打开`./debug/GenerateTestUserSig.js`文件。
3. 设置`GenerateTestUserSig.js`文件中的相关参数：
  <ul><li>SDKAPPID：默认为0，请设置为实际的 SDKAppID。</li>
  <li>SECRETKEY：默认为空字符串，请设置为实际的密钥信息。</li></ul> 
  <img src="https://main.qcloudimg.com/raw/bf4e96ecc305b7d4eee5ec677a52b6a2.png">
4. 粘贴完成后，单击【已复制粘贴，下一步】即创建成功。
5. 配置修改完成后，单击【回到控制台概览】即可。

>!
>- 本文提到的生成 UserSig 的方案是在客户端代码中配置 SECRETKEY，该方法中 SECRETKEY 很容易被反编译逆向破解，一旦您的密钥泄露，攻击者就可以盗用您的腾讯云流量，因此**该方法仅适合本地跑通 Demo 和功能调试**。
>- 正确的 UserSig 签发方式是将 UserSig 的计算代码集成到您的服务端，并提供面向 App 的接口，在需要 UserSig 时由您的 App 向业务服务器发起请求获取动态 UserSig。更多详情请参见 [服务端生成 UserSig](https://cloud.tencent.com/document/product/647/17275#Server)。
### 步骤4：开通小程序类目与推拉流标签权限
出于政策和合规的考虑，微信暂未放开所有小程序对实时音视频功能（即 &lt;live-pusher&gt; 和 &lt;live-player&gt; 标签）的支持：
- 小程序推拉流标签不支持个人小程序，只支持企业类小程序。
- 小程序推拉流标签使用权限暂时只开放给有限 [类目](https://developers.weixin.qq.com/miniprogram/dev/component/live-pusher.html)。
- 符合类目要求的小程序，需要在【[微信公众平台](https://mp.weixin.qq.com)】>【开发】>【接口设置】中自助开通该组件权限，如下图所示：
  ![](https://web.sdk.qcloud.com/trtc/miniapp/doc/zh-cn/ad87091aaae2db6ad412136297886c15.png)

### 步骤5：编译运行
1. 打开HBuilderX，选择【导入】->【从本地目录导入】。
2. 打开manifest.json，设置自己uni-app应用标识（AppID）以及其他配置（注：demo代码为vue2版本）。
   ![](https://qcloudimg.tencent-cloud.cn/raw/3be55111c2553724db1c9b1e7461ba75.png)
3. 点击【运行】->【运行到小程序模拟器】->【微信开发者工具】，即可正常查看编译效果。

>!
>- 小程序 &lt;live-player&gt; 和 &lt;live-pusher&gt; 标签需要在手机微信上才能使用，微信开发者工具上无法使用。
>- 为了小程序能够使用腾讯云房间管理服务，您需要在手机微信上开启调试功能：手机微信扫码二维码后，单击右上角【...】>【打开调试】。
   ![](https://web.sdk.qcloud.com/trtc/miniapp/doc/zh-cn/9ae12892a437c25c2317fb62f7f851ba.png)

## 常见问题

### 1. 查看密钥时只能获取公钥和私钥信息，该如何获取密钥？
TRTC SDK 6.6 版本（2019年08月）开始启用新的签名算法 HMAC-SHA256。在此之前已创建的应用，需要先升级签名算法才能获取新的加密密钥。如不升级，您也可以继续使用 [老版本算法 ECDSA-SHA256](https://cloud.tencent.com/document/product/647/17275#Old)，如已升级，您按需切换为新旧算法。

升级/切换操作：
1. 登录 [实时音视频控制台](https://console.cloud.tencent.com/trtc)。
2. 在左侧导航栏选择【应用管理】，单击目标应用所在行的【应用信息】。
3. 选择【快速上手】页签，单击【第二步 获取签发UserSig的密钥】区域的【点此升级】、【非对称式加密】或【HMAC-SHA256】。
- 升级：
  ![](https://web.sdk.qcloud.com/trtc/miniapp/doc/zh-cn/69bd0957c99e6a6764368d7f13c6a257.png)
- 切换回老版本算法 ECDSA-SHA256：
  ![](https://web.sdk.qcloud.com/trtc/miniapp/doc/zh-cn/f89c00f4a98f3493ecc1fe89bea02230.png)
- 切换为新版本算法 HMAC-SHA256：
  ![](https://web.sdk.qcloud.com/trtc/miniapp/doc/zh-cn/b0412153935704abc9e286868ad8a916.png)

### 2. 防火墙有什么限制？

由于 SDK 使用 UDP 协议进行音视频传输，所以对 UDP 有拦截的办公网络下无法使用，如遇到类似问题，请参考文档：[应对公司防火墙限制](https://cloud.tencent.com/document/product/647/34399)。
