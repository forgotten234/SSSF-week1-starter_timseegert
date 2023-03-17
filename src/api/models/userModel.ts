import {promisePool} from '../../database/db';
import CustomError from '../../classes/CustomError';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {GetUser, PostUser, PutUser, User} from '../../interfaces/User';

const getAllUsers = async (): Promise<User[]> => {
  const [rows] = await promisePool.execute<GetUser[]>(
    `
    SELECT user_id, user_name, email, role 
    FROM sssf_user
    `
  );
  if (rows.length === 0) {
    throw new CustomError('No users found', 404);
  }
  return rows;
};

const getUser = async (userId: string): Promise<User> => {
    const sql = promisePool.format(`
    SELECT user_id, user_name, email, role 
    FROM sssf_user 
    WHERE user_id = ?;
    `,
    [userId])
  const [rows] = await promisePool.execute<GetUser[]>(
    sql
  );
  if (rows.length === 0) {
    throw new CustomError('No users found', 404);
  }
  return rows[0];
};

const addUser = async (user: PostUser): Promise<number> => {
    const [headers] = await promisePool.execute<ResultSetHeader>(
      `INSERT INTO sssf_user (user_name, email, role, password) VALUES (?, ?, ?, ?)`,
      [
        user.user_name,
        user.email,
        user.role,
        user.password,
      ]
    );
    if (headers.affectedRows === 0) {
        throw new CustomError('No user added', 400);
    }
    console.log(headers.info);
    return headers.insertId;
  };

const updateUser = async (
    userId: number,
    user: PutUser,
  ): Promise<boolean> => {

    const sql = promisePool.format(`UPDATE sssf_user SET ? WHERE user_id = ?;`, [
        user,
        userId,
      ])
    const [headers] = await promisePool.execute<ResultSetHeader>(sql
    );
    console.log(sql)
    if (headers.affectedRows === 0) {
      throw new CustomError('User not found', 404);
    }
    return true;
  };

const deleteUser = async (userId: number): Promise<boolean> => {
    const [headers] = await promisePool.execute<ResultSetHeader>(
        `
        DELETE FROM sssf_user 
        WHERE user_id = ?;
        `,
        [userId]
    );
    if (headers.affectedRows === 0) {
        throw new CustomError('No cats deleted', 400);
    }
    return true;
};

const getUserLogin = async (email: string): Promise<User> => {
  const [rows] = await promisePool.execute<GetUser[]>(
    `
    SELECT * FROM sssf_user 
    WHERE email = ?;
    `,
    [email]
  );
  if (rows.length === 0) {
    throw new CustomError('Invalid username/password', 200);
  }
  return rows[0];
};

export {getAllUsers, getUser, addUser, updateUser, deleteUser, getUserLogin};
