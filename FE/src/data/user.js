import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("ui.db");

export const createTableAuthUsers = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE table if not EXISTS auth_users (
        	id INTEGER PRIMARY KEY AUTOINCREMENT,
          token text not null,
          user_id int not null,
          username text not null,
          avatar text not null
        );`,
        [],
        () => console.log("create table auth_users success"),
        (error) => console.log("Error create table user: ", error),
      );
    });
  });
};

export const insertUser = (authUser) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO auth_users (token, user_id, username, avatar)
              VALUES ("${authUser.token}", ${authUser.id}, "${authUser.username}", "${authUser.avatar}");`,
        );
      },
      [],
      () => {
        resolve("insert success");
      },
      (error) => {
        reject("Error insert user:" + error.message);
      },
    );
  });
};

export const getAuthUserProperty = (property) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `select ${property} from auth_users limit 1;`,
          [],
          (transact, resultset) => {
            resolve(resultset?.rows?._array);
          },
        );
      },
      (error) => reject(error),
    );
  });
};

export const droptTable = (nameTable) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `DROP TABLE IF EXISTS ${nameTable}`,
        [],
        () => {
          console.log(`drop ${nameTable} success`);
          resolve(true);
        },
        (error) => {
          console.log(`drop ${nameTable} error`);
          reject(error);
        },
      );
    });
  });
};
