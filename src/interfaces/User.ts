import {RowDataPacket} from 'mysql2';
interface User {
  user_id: number;
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
}

interface GetUser extends RowDataPacket, User {}

interface PostUser extends Omit<User, 'user_id'> {}

interface PutUser extends Partial<PostUser>{}

// TODO: create interface GetUser that extends RowDataPacket and User

// TODO create interface PostUser that extends User but without id

// TODO create interface PutUser that extends PostUser but all properties are optional

export {User, GetUser, PostUser, PutUser};

