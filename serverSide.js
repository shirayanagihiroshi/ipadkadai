function doGet () {
  return HtmlService.createHtmlOutputFromFile('index');
}

function test0 () {

  getKadaiFromDB('2023-04-07');
}


function getKadaiFromDB(dayStr) {
  const sheetName = 'kadaiQuery';
  let str, sheet, range, values,
    lock = LockService.getScriptLock();

  if (lock.tryLock(3000)) { // 処理が重複した場合、3秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    range = sheet.getRange(1,1,1,1);

    // まずはqueryシートにqueryを書き、該当データを絞り込む
    str = '=query(' + "'" + 'kadai' + "'" + '!A:F,';
    str += '"select A,B,C,D,E where A <= date'+ " '" + dayStr+ "' ";
    str += 'and B >= date' + " '" + dayStr+ "' ";
    str += 'and F is null order by B asc",1)';

    range.setValues([[str]]);

    // queryで絞り込まれたデータを取得し、返す。
    range = sheet.getRange(1,1,sheet.getLastRow(),5); // AからEで5列
    values = range.getValues()

    lock.releaseLock(); //ロックを解除

    // 驚異！！日付型など、いくつかの種類ものは渡せない！
    // 仕方がないので文字列へ変換して返す
    for (let i in values) {
      if (i != 0) { //最初はタイトルで日付型じゃないから飛ばさないと怒られる
        values[i][0] = Utilities.formatDate(values[i][0], 'JST', 'yyyy-MM-dd')
        values[i][1] = Utilities.formatDate(values[i][1], 'JST', 'yyyy-MM-dd')
      }
    }

  } else {
    // do nothing
  }

  return {
     result : values
  }
}

function test () {

  putKadaiToDB('2023-01-11', '2023-2-23', '証明マラソン2');
}

function putKadaiToDB(karaStr, madeStr, naiyou, delrow) {
  const sheetName = 'kadai',
    userId   = Session.getActiveUser().getUserLoginId();
  let sheet, range,
    lock = LockService.getScriptLock();

  if (lock.tryLock(3000)) { // 処理が重複した場合、3秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);

    // 修正のときは、ます項目の削除を行う。
    if (delrow != 0) {
      range = sheet.getRange(delrow,6,1,1), // rowは削除対象の行、削除済を表すdeletebyは6列め
      range.setValues([[userId]]);
    }
    // 最終行に追加
    sheet.appendRow( [karaStr, madeStr, naiyou, userId, '=row()'] );

    lock.releaseLock(); //ロックを解除
  } else {
    // do nothing
  }

  return {
    result : 'OK'
  }
}

function test2 () {

  deleteKadaiInDB(24);
}

// 実際にデータを消さず、削除済みの印(誰が消したか分かるようにユーザIDを使う)をつける
function deleteKadaiInDB(row) {
  const sheetName = 'kadai',
    userId   = Session.getActiveUser().getUserLoginId();
  let sheet, range,
    lock = LockService.getScriptLock();

  if (lock.tryLock(3000)) { // 処理が重複した場合、3秒間は他の人が終わるのを待つ

    sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    range = sheet.getRange(row,6,1,1), // rowは削除対象の行、削除済を表すdeletebyは6列め
    range.setValues([[userId]]);

    lock.releaseLock(); //ロックを解除
  } else {
    // do nothing
  }

  return {
    result : 'OK'
  }
}
