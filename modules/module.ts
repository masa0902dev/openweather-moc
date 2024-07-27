import fs from "fs";
import path from "path";

// 今後変わる可能性のあるパラメタ
const read_file_path = "../scraping.csv"; //トップディレクトリのscraping.csvのパス
const skip_row = 1; //上記scraping.csvについて
export const target_urls_all = readAllLineCSV(read_file_path, skip_row); //[ [5,26,5110,23100,Aichi,51,名古屋], [3,16,4410,13104,Tokyo,44,東京],  ...]

const apiURL = "https://heatstroke.jp/api/";
async function getAPI(url) {
  try {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    throw new Error("Failed to fetch API data from " + url);
  }
}

// ----------------この関数はオリジナルなので加えること----------------------
// １列, 何の型かは制限しない。
// 相対パス
// 指定CSVファイル(1つ)のヘッダを除く全行を読み込み、１次元配列として返す。
// string, int -> array
export function readAllLineAnyOneColCSV(file_path: string, skip_row: number = 0) {
  file_path = path.join(__dirname, file_path);
  checkExpectedError();

  try {
    let content = fs.readFileSync(file_path, "utf8");
    let lines = content.split("\n");
    lines = lines.slice(skip_row);
    if (lines[lines.length - 1].trim() === "") {
      lines = lines.slice(0, -1);
    }
    return lines;
  } catch (err) {
    throw new Error("Failed to read file: " + err);
  }

  // ---内部で使用している関数たち
  function checkExpectedError() {
    if (!fs.existsSync(file_path)) {
      throw new Error("No such file: " + file_path);
    }
    if (skip_row < 0 || !Number.isInteger(skip_row)) {
      throw new Error("2nd argument (skip_row) must be a integer and 0 or over.");
    }
  }
}
// ----------------この関数はオリジナルなので加えること----------------------



// 相対パス
// 指定CSVファイル(1つ)のヘッダを除く全行を読み込み、二次元配列として返す。
// string, int -> array
function readAllLineCSV(file_path, skip_row = 0) {
  file_path = path.join(__dirname, file_path);
  // console.log(`----readAllLineCSV(): your inputs are below----\nfile_path: ${file_path}\nskip_row: ${skip_row}`);
  checkExpectedError();

  try {
    let content = fs.readFileSync(file_path, "utf8");
    let lines = content.split("\n");
    lines = lines.slice(skip_row);
    if (lines[lines.length - 1].trim() === "") {
      lines = lines.slice(0, -1);
    }
    let data = lines.map((line) => line.split(","));
    return data;
  } catch (err) {
    throw new Error("Failed to read file: " + err);
  }

  // ---内部で使用している関数たち
  function checkExpectedError() {
    if (!fs.existsSync(file_path)) {
      throw new Error("No such file: " + file_path);
    }
    if (skip_row < 0 || !Number.isInteger(skip_row)) {
      throw new Error("2nd argument (skip_row) must be a integer and 0 or over.");
    }
  }
}

// １列, int利用のcsvファイル限定!!!
// 相対パス
// 指定CSVファイル(1つ)のヘッダを除く全行を読み込み、１次元配列として返す。
// string, int -> array
function readAllLineOneColCSV(file_path, skip_row = 0) {
  file_path = path.join(__dirname, file_path);
  // console.log(`----readAllLineCSV(): your inputs are below----\nfile_path: ${file_path}\nskip_row: ${skip_row}`);
  checkExpectedError();

  try {
    let content = fs.readFileSync(file_path, "utf8");
    let lines = content.split("\n");
    lines = lines.slice(skip_row);
    if (lines[lines.length - 1].trim() === "") {
      lines = lines.slice(0, -1);
    }
    let int_lines = lines.map((line) => parseInt(line));
    return int_lines;
  } catch (err) {
    throw new Error("Failed to read file: " + err);
  }

  // ---内部で使用している関数たち
  function checkExpectedError() {
    if (!fs.existsSync(file_path)) {
      throw new Error("No such file: " + file_path);
    }
    if (skip_row < 0 || !Number.isInteger(skip_row)) {
      throw new Error("2nd argument (skip_row) must be a integer and 0 or over.");
    }
  }
}

// 指定CSVファイル(1つ)の「行末からN行分」を読み込み、二次元配列として返す。
// string, int -> array
function readLastNLineCSV(file_path, last_n_line = 1) {
  file_path = path.join(__dirname, file_path);
  // console.log(`----readLastNLineCSV(): your inputs are below----\nfile_path: ${file_path}\nlast_n_line: ${last_n_line}`);
  checkExpectedError();

  try {
    let content = fs.readFileSync(file_path, "utf8");
    let lines = content.split("\n");
    if (lines[lines.length - 1].trim() === "") {
      lines = lines.slice(0, -1);
    }
    const line_length = lines.length;
    if (last_n_line <= line_length) {
      //実際の行数がN未満の場合を避ける。避けなくても問題ないが、無駄な処理を避けるため。
      lines = lines.splice(last_n_line * -1); // 行末からN行分を取得(行末の空白は削除されている)
    }
    let data = lines.map((line) => line.split(","));
    return data;
  } catch (err) {
    throw new Error("Failed to read file: " + err);
  }

  // ---内部で使用している関数たち
  function checkExpectedError() {
    if (!fs.existsSync(file_path)) {
      throw new Error("No such file: " + file_path);
    }
    if (last_n_line < 1 || !Number.isInteger(last_n_line)) {
      throw new Error("2nd argument (last_n_line) must be a integer and positive.");
    }
  }
}

// 機能は一切変更していない。エラーハンドリングのみ追加。
// 「絶対ファイルパス」で指定したファイルを上書きor新規作成。
// 引数recordが...二次元配列と一次元配列:複数行書き込み、intやstring:エラー
// 既存のCSVは上書きされる！forecastで使用中。
// string, int -> void
function writeCSV(file_path, record) {
  checkExpectedError();

  try {
    let csv_content = "";
    record.forEach((value) => {
      csv_content += value + "\n";
    });
    fs.writeFileSync(file_path, csv_content);
  } catch (error) {
    throw new Error("FAILED to write: " + error);
  }

  // ---内部で使用している関数たち
  function checkExpectedError() {
    const dir_path = path.dirname(file_path);
    if (!fs.existsSync(dir_path)) {
      throw new Error("No such directory " + dir_path);
    }
  }
}

// 相対ファイルパスを指定してCSVファイルに「追記」する。
// 引数recordが...二次元配列:複数行追記、一次元配列:1行追記、intやstring:1行追記
// 既存ファイルに対しては追記、存在しないファイルに対しては新規作成して書き込む。
// string, array -> void
export function appendCSV(file_path, record) {
  const raw_file_path = file_path; //checkExpectedError()でrecordの長さチェックに使用
  file_path = path.join(__dirname, file_path);
  // console.log(`----appendCSV(): your inputs are below----\nfile_path: ${file_path}\nrecord:`, record);
  const file_exists = fs.existsSync(file_path);
  checkExpectedError();

  try {
    let csv_content = "";
    if (Array.isArray(record[0])) {
      // 引数recordが二次元配列の場合
      record.forEach((value) => {
        csv_content += value + "\n";
      });
    } else {
      // 引数recordが一次元配列またはintやstringの場合
      csv_content += record + "\n";
    }
    if (file_exists) {
      fs.appendFileSync(file_path, csv_content);
      // console.log("SUCCESS: appended in " + file_path);
    } else {
      fs.writeFileSync(file_path, csv_content);
      // console.log("SUCCESS: created a new file and wrote in " + file_path);
    }
  } catch (error) {
    throw new Error("FAILED to append or create or write: " + error);
  }

  // ---内部で使用している関数たち
  function checkExpectedError() {
    const dir_path = path.dirname(file_path);
    if (!fs.existsSync(dir_path)) {
      fs.mkdirSync(dir_path, { recursive: true }); // ディレクトリが存在しない場合に作成
    }
    if (file_exists) {
      const existing_line = readLastNLineCSV(raw_file_path)[0];
      if (existing_line != undefined) {
        //「ファイルは存在するが中身が空」の場合はthrow new Errorしない。
        // 注意）measured/dailyでこのエラーが邪魔になるので、コメントアウトしている。
        // // 引数recordが二次元配列の場合
        // if (Array.isArray(record[0])) {
        //     record.forEach(arr => {
        //         if (arr.length != existing_line.length) {
        //             throw new Error("appendCSV() -> [now 2nd-argument(record) is Two-dimentional array] Each array length in record is dirrerent from the existing line length in the CSV file.\n" + "Existing line length: " + existing_line.length + "\nYour Input length: " + arr.length);
        //         }
        //     });
        // } else if (Array.isArray(record)) {
        //     // 引数recordが一次元配列の場合
        //     if (record.length != existing_line.length) {
        //         throw new Error("appendCSV() -> [now 2nd-argument(record) is One-dimentional array] The array length of record is dirrerent from the existing line length in the CSV file\n" + "Existing line length: " + existing_line.length + "\nYour Input length: " + record.length);
        //     }
        // } else {
        //     // 引数recordが配列でない場合
        //     if (existing_line.length != 1) {
        //         throw new Error("appendCSV() -> [now 2nd-argument(record) is Not an array] The existing line length in the CSV file is Not 1.\n" + "Existing line length: " + existing_line.length + "\nYour Input length: 1");
        //     }
        // }
      }
    }
  }
  // 指定CSVファイル(1つ)の「行末からN行分」を読み込み、必ず二次元配列として返す。
  // string, int -> array
  function readLastNLineCSV(file_path, last_n_line = 1) {
    file_path = path.join(__dirname, file_path);
    checkExpectedError();

    let data;
    try {
      let content = fs.readFileSync(file_path, "utf8");
      let lines = content.split("\n");
      if (lines[lines.length - 1].trim() === "") {
        lines = lines.slice(0, -1);
      }
      const line_length = lines.length;
      if (last_n_line <= line_length) {
        //実際の行数がN未満の場合を避ける。避けなくても問題ないが、無駄な処理を避けるため。
        lines = lines.splice(last_n_line * -1); // 行末からN行分を取得(行末の空白は削除されている)
      }
      data = lines.map((line) => line.split(","));
      return data;
    } catch (err) {
      throw new Error("Failed to read file: " + err);
    }

    // ---内部で使用している関数たち
    function checkExpectedError() {
      if (!fs.existsSync(file_path)) {
        fs.mkdirSync(dir_path, { recursive: true }); // ディレクトリが存在しない場合に作成
      }
      if (last_n_line < 1 || !Number.isInteger(last_n_line)) {
        throw new Error("2nd argument (last_n_line) must be a integer and positive.");
      }
    }
  }
}

// 相対ファイルパスを指定して、二次元配列(一次も可能)をCSVファイルに書き込む。ヘッダは1行目のみ(指定なしならヘッダ行なし)。
// 引数recordが...二次元配列:複数行追記、一次元配列:1行追記、intやstring:1行追記
// 既存ファイルに対しては上書き、存在しないファイルに対しては新規作成して書き込む。
// string, array, string -> void
function createCSV(file_path, record, header = "") {
  file_path = path.join(__dirname, file_path);
  // console.log(`----createCSV(): your inputs are below----\nfile_path: ${file_path}\nrecord:`, record, `\nheader: ${header}`);
  checkExpectedError();

  try {
    let csv_content = "";
    if (header !== "") {
      csv_content += header + "\n";
    }
    if (Array.isArray(record[0])) {
      // 引数recordが二次元配列の場合
      record.forEach((value) => {
        csv_content += value + "\n";
      });
    } else {
      // 引数recordが一次元配列またはintやstringの場合
      csv_content += record + "\n";
    }
    fs.writeFileSync(file_path, csv_content);
    // console.log("SUCCESS: wrote in " + file_path);
  } catch (error) {
    throw new Error("FAILED to write: " + error);
  }

  // ---内部で使用している関数たち
  function checkExpectedError() {
    const dir_path = path.dirname(file_path);
    if (!fs.existsSync(dir_path)) {
      throw new Error("No such directory " + dir_path);
    }
    if (fs.existsSync(file_path)) {
      throw new Error(
        "File already exists: " +
          file_path +
          "\nIf you want to append some data on existing csv files, please use appendCSV()."
      );
    }
    if (typeof header !== "string") {
      throw new Error("3rd argument (header) must be a string.");
    }
  }
}

// 指定ディレクトリ直下の全CSVファイルの(書き込みがある)行末を削除する。(注：行末に空白が２行あると書き込みのある行を削除できない)
// string -> void
function rmAllLastLineCSV(dir_path) {
  dir_path = path.join(__dirname, dir_path);
  console.log(`----rmAllLastLineCSV(): your inputs are below----\ndir_path: ${dir_path}`);
  checkExpectedError();

  // csvファイルのみを抽出
  const files_and_dirs = fs.readdirSync(dir_path);
  const file_names = files_and_dirs.filter((file_name) => {
    const extension = path.extname(file_name).toLowerCase();
    return extension == ".csv";
  });

  let file_path;
  let number_of_files = file_names.length;
  let success_count = 0;
  file_names.forEach((file_name, i) => {
    try {
      file_path = path.join(dir_path, file_name);
      let data = fs.readFileSync(file_path, "utf8");
      let lines = data.split("\n");
      // 行末が空ならば、最後から2行目を削除。そうでなければ行末を削除。
      if (lines[lines.length - 1].trim() == "") {
        lines.splice(-2, 1);
      } else {
        lines.pop();
      }
      // 改行文字で連結して新しいデータを作成
      let new_data = lines.join("\n");
      // 最後の行を削除した内容で上書き
      fs.writeFile(file_path, new_data, (err) => {
        if (err) {
          throw new Error("Failed to write file: " + err);
        }
      });
      success_count++;
      // console.log("[" + (i+1) + "/" + number_of_files + "] SUCCEEDED in removing last line from: " + file_path);
      console.log("[" + success_count + "/" + number_of_files + "]");
    } catch (error) {
      console.error("\nFAILED to remove last line: " + error + "\n");
    }
  });

  if (success_count == number_of_files) {
    console.log(
      "\nALL SUCCEEDED in removing last line. [" + success_count + "/" + number_of_files + "]\n"
    );
  } else {
    console.log(
      "\nSOME FAILED to remove last line. [" + success_count + "/" + number_of_files + "]\n"
    );
  }

  // ---内部で使用している関数たち
  function checkExpectedError() {
    if (!fs.existsSync(dir_path)) {
      throw new Error("No such directory:", dir_path);
    }
  }
}

// 指定CSVファイル(1つ)の(書き込みのある)行末を削除する。(注：行末に空白が２行あると書き込みのある行を削除できない)
function rmLastLineCSV(file_path) {
  file_path = path.join(__dirname, file_path);
  console.log(`----rmLastLineCSV(): your inputs are below----\nfile_path: ${file_path}`);
  checkExpectedError();

  try {
    let data = fs.readFileSync(file_path, "utf8");
    let lines = data.split("\n");
    // 行末が空ならば、最後の2行目を削除。そうでなければ、最後の行を削除。
    if (lines[lines.length - 1].trim() === "") {
      lines.splice(-2, 1);
    } else {
      lines.pop();
    }
    // 改行文字で連結して新しいデータを作成
    let new_data = lines.join("\n");
    // 最後の行を削除した内容で上書き
    fs.writeFileSync(file_path, new_data);
    console.log("\nSUCCEEDED in removing last line from: " + file_path + "\n");
  } catch (error) {
    console.error("\nFAILED to remove last line: " + error + "\n");
  }

  // ---内部で使用している関数たち
  function checkExpectedError() {
    if (!fs.existsSync(file_path)) {
      throw new Error("No such file or directory:", file_path);
    }
  }
}

