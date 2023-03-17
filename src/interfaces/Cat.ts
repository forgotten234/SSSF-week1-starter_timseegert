import {RowDataPacket} from 'mysql2';
import {PostUser, User} from './User';
interface Cat {
    cat_id: number,
    cat_name: string,
    weight: number,
    filename: any,
    birthdate: string,
    lat: number,
    lng: number,
    owner: User | number
  // TODO: create a cat interface
  // owner should be a User or a number
}

interface GetCat extends RowDataPacket, Cat {}

interface PostCat extends Omit<Cat, "cat_id"> {}

interface PutCat extends Partial<PostCat> {}

// TODO: create PostCat interface. Same as cat but without id

// TODO: create PutCat interface. Sameas PostCat but properties are optional

export {Cat, GetCat, PostCat, PutCat};
