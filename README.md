# openweather-moc

lat, lon
https://openweathermap.org/api/geocoding-api


one call api3.0
https://openweathermap.org/api/one-call-3#history_daily_aggregation


### Daily Aggregation
これで可能：今年１年の実測気温、1週間の予報気温


## file
- fetch_temperature.mjs:  
福島市だけ例外処理した。すでに47都道府県で正常動作を確認（location_jpの正しい日本語表記を確認）。  
全て県庁所在地で取得している。Aichi-kenではなくNagoya、TokyoではなくShinjuku。
- module.js:
    - readAllLineAnyOneColCSV()追加、最下部のexportにも書き加える
    - appendCSV()の無駄なifを削除。appendFileSyncは新規作成も自分でやってくれる。
- csv_list.csv: すでに47都道府県
- .env: APIキーは本番用に書き換えること。


## ESmodule VS CommonJS
- 可能：ESmoduleファイルからCommonJSファイルを参照
- 不可能：CommonJSからESmodule

- 折衷案：ESmoduleを中間モジュールを使用してCommonJSで読みこむ(今回は必要ない)
