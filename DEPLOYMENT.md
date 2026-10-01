# Netlify公開結果

2026年10月1日17:07 JST、ユーザー承認後に手動配備。

- 公開URL：https://venerable-dragon-47f942.netlify.app/
- 管理画面：https://app.netlify.com/projects/venerable-dragon-47f942/overview
- 配備ID：6abe14a59f759a3310d21b86
- 公開状態：Public production site（管理画面で確認）
- 対象：publicの5ファイルのみ。Netlifyが設定ファイルを処理した結果、配備表示は4 new files uploaded。
- 既存Chromeログインを使用し、ネイティブのフォルダ選択で配備。OAuth、新規トークン、拡張機能権限、有料プラン変更、独自ドメイン購入なし。

Netlifyにログインしていないアプリ内ブラウザからHTTPS公開URLが開くことを確認。価格198円を数量3で追加、550円を追加し、合計1,144円・残予算1,856円を確認。再読み込み後も復元。「オフラインで使えます。」のキャッシュ完了表示を確認。

公開後の実通信切断テスト、iPhone・Android実機は未実施。ローカルChromeではオフラインと更新を検証済み。

白画面報告に対して、Macの既存Chromeで http://127.0.0.1:8765/ を開き、画面が正常に表示されることを目視確認した。報告された白画面のURL・ブラウザは未確定で、原因はまだ断定できない。サーバー再起動はAddress already in useとなり、ブラウザで応答したため稼働中と確認。

## テンキー版とサイト名変更

2026年10月1日17:14 JST、テンキー版を同じサイトへ一度だけ手動更新（配備ID：6abe1672d763770c9dcb29b8）。17:15 JST、承認された `kaimono-yosan` へサイト名を変更。Site IDは90da27a9-5955-4c21-bf88-ef21feeb59ebのまま。

**現在の公開URL：https://kaimono-yosan.netlify.app/**
管理画面：https://app.netlify.com/projects/kaimono-yosan/configuration/general

非ログインの別ブラウザで新URLのHTTPS表示、アプリ内テンキーで198を入力、標準キーボード切替時の値保持、キャッシュ完了表示を確認。

旧URLは、キャッシュ済みルートの影響を避けるため `?publication-check=20261001` 付きでネットワークへアクセスし、NetlifyのSite not foundを確認。新URLへのリダイレクトはない。旧URLをキャッシュ済みのブラウザでは旧画面が残る可能性がある。保存データはオリジン別のため新URLに移行しない。ユーザーには変更前に親から説明済み。

新URLでも198円×3＋550円＝1,144円・残1,856円、再読み込み復元を確認。Mac Chromeで公開版テンキーを開いて目視確認。ローカルURLは旧版の更新待機表示を確認後、自分の確認タブを閉じて開き直し、同じURLでテンキー版が表示されることを確認した。
