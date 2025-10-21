# MulmoCast Viewer

### install
```
yarn install mulmocast-viewer
```

## usage

MulmoView は、mulmocast-cli で生成したバンドル（JSON とメディアファイル群）を読み込み、ブラウザ上で再生・表示するためのコンポーネントです。
以下のように Vue コンポーネントとして簡単に利用できます。

```
<template>
  <div>
    <MulmoView :data-set="data" :base-path="basePath" />
  </div>
</template>

<script setup lang="ts">
import { MulmoView } from "mulmocast-viewer";

import { data } from "./data"; // mulmo_view.json
const basePath = "{bundle folder path}";
</script>

```

### mulmocast-cliでbundleを作成

```
mulmocast bundle some/mulmo/file.json
```

#### 生成フォルダを配置
生成されたbundleのフォルダを、プロジェクト内の /media_dir/ にコピーします。(Vueの場合、/public/media_dir)
ディレクトリ名は任意で構いません（例: /media_demo/ でも可）

#### JSONデータの読み込み

mulmo_view.json を直接 import して data に代入するか、

または外部リクエスト等で読み込んで data に渡します。

### basePath の設定
basePathに/media_dir（または URL）を指定します。
MulmoView 内ではこのパスを基準に、画像・音声・動画などのメディアファイルを相対的に参照します。

💡 たとえば、basePath に "https://example.com/bundle_demo/" を指定しても動作します。


# 開発向け

このレポジトリではviewerを開発するための環境を用意しています。
その環境では、以下の手順でbundleしたdirを参照することが可能です

## cliでbundleを作る

```
mulmocast bundle scripts/foo/bar.json
```

### 作成したfolderをviewerのpublic以下に配置する

重要なのは、以下のようなpathにmulmo_view.jsonが配置されているかどうかです。

```
public/bar/mulmo_view.json
```

### DataListを更新する

```
yarn run fileList
```

### サーバを起動する

```
yarn run dev
```