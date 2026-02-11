# Plan: 音声・動画再生バグの修正

## Context

MulmoCast Viewer (npm: `mulmocast-viewer`) で、ライブラリとして使用時に音声が意図しないタイミングで再生・停止するバグがある。メディアの組み合わせ（動画+音声、画像+音声等）と再生トリガー（ユーザー操作、自動再生等）の全パターンを整理し、コードを修正する。

## メディアパターンマトリクス

### 8種のメディア組み合わせ

| # | パターン | 使用要素 | 終了条件 |
|---|----------|----------|----------|
| 1 | videoWithAudioSource | videoWithAudioRef | video ended |
| 2 | videoSource + audioSource | videoRef + audioSyncRef | **両方** ended (長い方を待つ) |
| 3 | soundEffectSource + audioSource | videoRef + audioSyncRef | **両方** ended (長い方を待つ) |
| 4 | audioSource + imageSource | audioRef + img | audio ended |
| 5 | audioSource のみ | audioRef + placeholder img | audio ended |
| 6 | imageSource のみ | img + sleep(duration) | sleep 完了 |
| 7 | videoSource のみ | videoRef (audioSyncRef=null) | video ended |
| 8 | soundEffectSource のみ | videoRef (audioSyncRef=null) | video ended |

### video/audio 長さ不一致の動作 (パターン 2, 3)

| ケース | 動作 |
|--------|------|
| audio が先に終了 | audio ended → video 再生継続 → video ended → 'ended' 発火 |
| video が先に終了 | video ended → audio 再生継続 → audio ended → 'ended' 発火 |
| ユーザーが video を pause (audio 終了後) | audio は再開しない (ended 状態のため) |
| ユーザーが video を seek (audio 終了後) | audio は再開しない (ended 状態のため) |

### 4種の再生トリガー

| トリガー | 動作 |
|----------|------|
| ユーザー明示再生 | ユーザーが play ボタンを押す |
| 自動再生 (ビート遷移) | handleEnded → 次ビートへ自動進行 |
| 言語変更中 | stop → 500ms wait → 新音声で resume |
| ビートジャンプ | 再生中に Prev/Next クリック |

### BGM 動作ルール

| 状況 | BGM 動作 |
|------|----------|
| ユーザーが play → handlePlay | BGM 再生開始 |
| ユーザーが pause → handlePause | BGM 一時停止 |
| ビート自動遷移 (handleEnded → 次ビート) | **BGM 継続** (止めない) |
| Prev/Next ボタンクリック (再生中) | **BGM 継続** (止めない) |
| 最終ビート終了 → allCompleted | BGM 停止 |
| 言語変更中 | **BGM 継続** (止めない) |

## 確認されたバグ (9件)

### Bug 1: ended イベントの二重発火 (Critical)
**ファイル**: `src/components/mulmo_player.vue:187-201`
**原因**: handleVideoEnd と handleAudioEnd が両方とも相手の ended をチェック。同時に発火すると handleEnded() が2回呼ばれ、ビートが2つ進む。
**修正**: `endedEmitted` ガードフラグを追加。play() でリセット。

### Bug 2: waitAndPlay() の二重呼び出し (Critical)
**ファイル**: `src/components/mulmo_viewer.vue:198-209`
**原因**: handleEnded() → pageMove(1) → updatePage() → waitAndPlay() (1回目)。handleEnded() 内でも waitAndPlay() (2回目)。
**修正**: handleEnded() 内の waitAndPlay() を削除。updatePage() のみで呼ぶ (Prev/Next クリック時の自動再生も維持)。

### Bug 3: play() の Promise 未処理 (Medium)
**ファイル**: `src/components/mulmo_player.vue:234-260`
**原因**: `void element.play()` で catch なし。ビート高速切替時に DOMException。
**修正**: 全 play() に `.catch(() => {})` 追加。

### Bug 4: stop() メソッドの欠如 (Critical)
**ファイル**: `src/components/mulmo_player.vue:345-347`
**原因**: play() しかエクスポートされていない。ビューワーから停止する手段がなく、バックグラウンドタブの resume が意図しない再生を引き起こす。
**修正**: stop() メソッド追加。`isStopping` フラグで pause イベントを抑制し、**BGM がビート遷移中に止まらない**ようにする。

### Bug 5: 言語変更時のキャンセル機構なし (Medium)
**ファイル**: `src/components/mulmo_viewer.vue:100-119`
**原因**: 500ms sleep 中に再度言語変更されると play() が競合。
**修正**: generation カウンター + stop() で旧メディア停止。BGM は継続。

### Bug 6: ビート遷移時の旧メディア未停止 (Medium)
**ファイル**: `src/components/mulmo_viewer.vue:172-177`
**原因**: waitAndPlay() が前のビートを停止しない。
**修正**: waitAndPlay() 先頭で stop() 呼び出し + generation カウンター。stop() は isStopping フラグ付きなので BGM は継続。

### Bug 7: 画像のみビートの sleep キャンセル不可 (Medium)
**ファイル**: `src/components/mulmo_player.vue:255-258`
**原因**: `await sleep(duration)` に AbortController がない。
**修正**: cancellableSleep() 実装、stop() で中断。

### Bug 8: video seek 時の audio 同期なし (Low)
**ファイル**: `src/components/mulmo_player.vue` template
**原因**: ユーザーがビデオをシークしても audioSyncRef が追従しない。
**修正**: `@seeked` イベントハンドラ追加。ただし audio が ended の場合は同期しない。

### Bug 9: video resume 時に ended 済み audio が再開する (Medium)
**ファイル**: `src/components/mulmo_player.vue:163-171`
**原因**: handleVideoPlay() で audioSyncRef.play() を無条件に呼ぶ。audio が video より短い場合、video を pause → resume すると ended 済みの audio が最初から再開する。
**修正**: `!audioSyncRef.value.ended` チェックを追加。

## 変更ファイル一覧

### 1. `src/components/utils.ts`
- `cancellableSleep(ms, signal)` 追加: AbortSignal で中断可能な sleep

### 2. `src/components/mulmo_player.vue`
- `endedEmitted` ref + ガード (Bug 1)
- `isStopping` フラグ + `stop()` メソッド追加・エクスポート (Bug 4)
  - stop() 中の pause イベントを抑制 → viewer に 'pause' を emit しない → BGM 継続
- 全 `play()` に `.catch(() => {})` (Bug 3)
- `sleepAbortController` + `cancelSleepTimer()` (Bug 7)
- `@seeked="handleVideoSeeked"` (Bug 8) + ended チェック
- handleVideoPlay に `!audioSyncRef.value.ended` ガード (Bug 9)
- `onUnmounted` でクリーンアップ
- `console.log(e)` 削除

### 3. `src/components/mulmo_viewer.vue`
- handleEnded() 内の `waitAndPlay()` 削除 (Bug 2)
  - updatePage() のみで waitAndPlay() を呼ぶ (Prev/Next も動作)
- `waitAndPlay()` に generation カウンター + stop() (Bug 6)
- 言語変更 watch に generation カウンター + stop() (Bug 5)
- `mediaPlayer` ref 型に `stop` 追加
- `console.log` 削除

### 4. `src/views/ListView.vue`
- `playBeat()` で新 src 設定前に pause + currentTime リセット

### 5. `test/test_utils.ts` (新規)
- `cancellableSleep` テスト (正常完了, abort, 事前abort, 0ms)

### 6. `package.json`
- `test` スクリプト追加

## stop() の設計 (BGM を止めないための核心)

```
stop() 呼び出し:
1. isStopping = true
2. shouldBePlaying = false
3. endedEmitted = true (pending の ended を抑制)
4. cancelSleepTimer()
5. 全メディア要素 .pause()
   → ブラウザが 'pause' イベントを発火
   → handlePause/handleVideoPause が isStopping をチェック → return (emit しない)
   → viewer の handlePause は呼ばれない → BGM 継続

play() 呼び出し:
1. isStopping = false (フラグリセット)
2. endedEmitted = false
3. shouldBePlaying = true
4. メディア再生開始
```

## 後方互換性

- `stop()` は新規メソッド。既存利用者に影響なし
- `cancellableSleep` は新規エクスポート
- イベント発火の修正 (2回→1回) はバグ修正であり破壊的変更ではない

## 実装順序

1. `utils.ts` に cancellableSleep 追加
2. `mulmo_player.vue` の全バグ修正 (Bug 1, 3, 4, 7, 8, 9)
3. `mulmo_viewer.vue` の全バグ修正 (Bug 2, 5, 6)
4. `ListView.vue` の修正
5. テスト追加 + package.json 更新
6. `yarn format && yarn lint && yarn build` で検証
