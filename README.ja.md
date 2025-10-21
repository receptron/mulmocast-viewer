# MulmoCast Viewer

**MulmoCast Viewer** は、mulmocast-cli で生成されたバンドル（JSON とメディアファイル群）をブラウザ上で再生・表示するための Vue 3 コンポーネントライブラリです。

## インストール

```bash
npm install mulmocast-viewer
# または
yarn add mulmocast-viewer
```

## 使い方

### 基本的な使用方法

MulmoView コンポーネントを Vue アプリケーションで簡単に利用できます。

#### デフォルトUI（ボタン付き）

```vue
<template>
  <div>
    <MulmoView :data-set="data" :base-path="basePath" />
  </div>
</template>

<script setup lang="ts">
import { MulmoView } from 'mulmocast-viewer'
import 'mulmocast-viewer/style.css'

import data from './path/to/mulmo_view.json'
const basePath = '/media_bundle'
</script>
```

#### カスタムUIの作成

スロットを使用してナビゲーションボタンやレイアウトを自由にカスタマイズできます。

```vue
<template>
  <MulmoView :data-set="data" :base-path="basePath" v-slot="{ Page, pageProps, pageMove, currentPage, pageCount }">
    <div class="my-custom-layout">
      <button @click="pageMove(-1)" :disabled="currentPage === 0">
        ← 前へ
      </button>

      <Page v-bind="pageProps" />

      <button @click="pageMove(1)" :disabled="currentPage >= pageCount - 1">
        次へ →
      </button>

      <div class="page-info">
        {{ currentPage + 1 }} / {{ pageCount }}
      </div>
    </div>
  </MulmoView>
</template>

<script setup lang="ts">
import { MulmoView } from 'mulmocast-viewer'
import 'mulmocast-viewer/style.css'

import data from './path/to/mulmo_view.json'
const basePath = '/media_bundle'
</script>
```

## セットアップ手順

### 1. mulmocast-cli でバンドルを作成

```bash
mulmocast bundle path/to/your/file.json
```

### 2. 生成されたフォルダを配置

生成されたバンドルフォルダを、プロジェクトの公開ディレクトリに配置します。

- Vue プロジェクト: `/public/media_bundle/`
- その他: 任意の公開ディレクトリ

ディレクトリ名は自由に変更できます（例: `/public/demo_bundle/`）。

### 3. JSON データの読み込み

`mulmo_view.json` を以下のいずれかの方法で読み込みます：

#### 方法 1: 直接インポート

```typescript
import data from './path/to/mulmo_view.json'
```

#### 方法 2: 動的読み込み

```typescript
const response = await fetch('/media_bundle/mulmo_view.json')
const data = await response.json()
```

### 4. basePath の設定

`basePath` には、メディアファイルが配置されているディレクトリまたは URL を指定します。

```typescript
// ローカルパスの例
const basePath = '/media_bundle'

// 外部 URL の例
const basePath = 'https://example.com/bundle_demo'
```

MulmoView は、この `basePath` を基準に画像・音声・動画などのメディアファイルを相対的に参照します。

## API リファレンス

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `dataSet` | `ViewerData` | Yes | mulmo_view.json から読み込んだデータ |
| `basePath` | `string` | Yes | メディアファイルのベースパス（ローカルまたは URL） |
| `initPage` | `number` | No | 初期表示ページ（デフォルト: 0） |

### Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `updatedPage` | `nextPage: number` | ページが変更されたときに発火 |

### Slot Props（カスタムUI作成時）

デフォルトスロットで以下のプロパティとコンポーネントが利用可能です：

| Prop | Type | Description |
|------|------|-------------|
| `Page` | `Component` | ページコンポーネント（メディア表示用） |
| `pageProps` | `Object` | Page コンポーネントに渡す props |
| `currentPage` | `number` | 現在のページ番号（0始まり） |
| `pageCount` | `number` | 総ページ数 |
| `pageMove` | `(delta: number) => boolean` | ページ移動関数（-1: 前へ、1: 次へ） |
| `isPlaying` | `boolean` | メディアが再生中かどうか |
| `audioLang` | `Ref<string>` | 音声言語（変更可能） |
| `textLang` | `Ref<string>` | テキスト言語（変更可能） |
| `SelectLanguage` | `Component` | 言語選択コンポーネント |

## 開発者向け

このリポジトリは、ビューアコンポーネントの開発環境を提供しています。

### 開発環境のセットアップ

1. **バンドルを作成**

```bash
mulmocast bundle scripts/foo/bar.json
```

2. **生成されたフォルダを配置**

バンドルフォルダを `public/` 以下に配置します。以下のようなパスになるようにしてください：

```
public/bar/mulmo_view.json
```

3. **データリストを更新**

```bash
yarn run fileList
```

4. **開発サーバを起動**

```bash
yarn run dev
```

### ビルド

```bash
# ライブラリビルド
yarn run build:lib

# アプリケーションビルド
yarn run build:app

# 両方をビルド
yarn run build
```

## ライセンス

MIT