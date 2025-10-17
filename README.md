# MulmoCast Viewer


### cliでbundleを作る

```
yarn run cli bundle scripts/foo/bar.json
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