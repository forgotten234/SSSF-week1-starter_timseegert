import {promisePool} from '../../database/db';
import CustomError from '../../classes/CustomError';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {Cat, GetCat, PostCat, PutCat} from '../../interfaces/Cat';
import { userGet } from '../controllers/userController';

const getAllCats = async (): Promise<Cat[]> => {
  const [rows] = await promisePool.execute<GetCat[]>(
    `
    SELECT cat_id, cat_name, weight, filename, birthdate, ST_X(coords) as lat, ST_Y(coords) as lng,
    JSON_OBJECT('user_id', sssf_user.user_id, 'user_name', sssf_user.user_name) AS owner 
	  FROM sssf_cat 
	  JOIN sssf_user 
    ON sssf_cat.owner = sssf_user.user_id
    `
  );
  if (rows.length === 0) {
    throw new CustomError('No cats found', 404);
  }
  const cats: Cat[] = rows.map((row) => ({
    ...row,
    owner: JSON.parse(row.owner?.toString() || '{}'),
  }));

  return cats;
};

// TODO: create getCat function to get single cat
const getCat = async (id: number) => {
    const [rows] = await promisePool.execute<GetCat[]>(
        `
        SELECT cat_id, cat_name, weight, filename, birthdate, ST_X(coords) as lat, ST_Y(coords) as lng,
        JSON_OBJECT('user_id', sssf_user.user_id, 'user_name', sssf_user.user_name) AS owner 
            FROM sssf_cat 
            JOIN sssf_user 
        ON sssf_cat.owner = sssf_user.user_id
        WHERE cat_id = ?`,
        [id]
    );
    if (rows.length === 0) {
        throw new CustomError('No cat found', 500);
    }

    const cat: Cat = {
        ...rows[0],
        owner: JSON.parse(rows[0].owner?.toString() || '{}'),
    };

    return cat;
};


const addCat = async (data: PostCat): Promise<number> => {
    const sql = promisePool.format(`
    INSERT INTO sssf_cat (cat_name, weight, owner, filename, birthdate, coords) 
    VALUES (?, ?, ?, ?, ?, POINT(?, ?))
    `,
    [
      data.cat_name,
      data.weight,
      data.owner,
      data.filename,
      data.birthdate,
      data.lat,
      data.lng,
    ])
  const [headers] = await promisePool.execute<ResultSetHeader>(
    sql
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('No cats added', 400);
  }
  console.log(headers.info);
  return headers.insertId;
};

// TODO: create updateCat function to update single cat
// if role is admin, update any cat
// if role is user, update only cats owned by user

const updateCat = async (
    id: number,
    cat: PutCat,
    //role:
  ): Promise<boolean> => {
    console.log(cat)
    const sql = promisePool.format(`UPDATE sssf_cat SET ? WHERE cat_id = ?`,
    [
      cat,
      id
    ])
    console.log(sql)
    const [headers] = await promisePool.execute<ResultSetHeader>(sql);
    if (headers.affectedRows === 0) {
      throw new CustomError('Animal not found', 404);
    }
    return true;
  };

const deleteCat = async (catId: number): Promise<number> => {
    const sql = promisePool.format(    
        `
        DELETE FROM sssf_cat 
        WHERE cat_id = ?;
        `,
        [catId]
    )
    console.log(sql)
  const [headers] = await promisePool.execute<ResultSetHeader>(
    sql
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('No cats deleted', 400);
  }
  return headers.affectedRows;
};

export {getAllCats, getCat, addCat, updateCat, deleteCat};
