# Chronora

Chronora 是一个围绕八字排盘做的小型 WebApp。

项目主要用来整理出生信息、生成四柱命盘，并展示五行、十神、神煞、真太阳时等基础内容。用户也可以补充想看的问题，再进入命盘解读页面。

## 功能

- 八字四柱排盘
- 出生地搜索与真太阳时修正
- 五行分布、藏干、十神、神煞展示
- 常用资料保存，方便下次快速填入
- 基于命盘和补充信息的一次性解读

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- lunar-typescript

出生地搜索对中国城市、区县使用仓库内的离线坐标数据，以便云端无法连接外部地理服务时仍可搜索。数据来自 [city-geo](https://github.com/88250/city-geo)，其许可证保存在 `data/CHINA_CITY_GEO_LICENSE`。境外地点仍依赖外部搜索服务。

## 本地运行

```bash
npm install
npm run dev
```

如需使用 AI 解读，请在本地 `.env.local` 或部署平台的服务端环境变量中配置 `DEEPSEEK_API_KEY`。密钥不要写入前端代码或提交到 Git。

## CloudBase 云托管部署

- 项目已配置 Next.js standalone 输出和根目录 `Dockerfile`。
- CloudBase Git 平台部署选择 `DeTaiDong/Chronora` 的 `main` 分支，开启服务端口 `3000`。
- 服务环境变量配置 `DEEPSEEK_API_KEY`；`DEEPSEEK_MODEL` 可选，默认使用 `deepseek-flash`。
- 推送新提交到 `main` 后，CloudBase 可按分支推送自动构建和部署。

## 说明

命理内容只作为传统文化和娱乐参考，不构成医疗、法律、投资或人生重大决策建议。

不同流派对部分神煞和取法会有差异，当前实现仍会继续校正。
