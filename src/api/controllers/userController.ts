import {
  addUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../models/userModel';
import {Request, Response, NextFunction, response} from 'express';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcryptjs';
import {PostUser, PutUser, User} from '../../interfaces/User';
import {validationResult} from 'express-validator';
import MessageResponse from '../../interfaces/MessageResponse';
import { putUser } from '../../../test/userFunctions';
const salt = bcrypt.genSalt(10)

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
    req: Request<{}, {}, PostUser>,
    res: Response,
    next: NextFunction
  ) => {
    try {
        const errors = validationResult(req.body);
        if (!errors.isEmpty()) {
            const message = errors
            .array()
            .map((error) => `${error.msg}: ${error.param}`)
            .join(', ');
            throw new CustomError(message, 400);
        }   

        if(!req.body.role){
            req.body.role = 'user'
        }

        const user = await addUser({
            user_name: req.body.user_name,
            email: req.body.email,
            role: req.body.role,
            password: await bcrypt.hash(req.body.password, 10)
        });
        const message: MessageResponse = {
            message: `User with id ${user} created`,
        };
        res.json({
            message,
            user_id: user
        })
    } catch (error) {
      next(error);
    }
  };

// TDOD: create userPost function to add new user
// userPost should use addUser function from userModel
// userPost should use validationResult to validate req.body
// userPost should use bcrypt to hash password

const userPut = async (
  req: Request<{id: number}, {}, PutUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    if ((req.user as User).role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }

    const user = req.body;

    const result = await updateUser(req.params.id, user);
    if (result) {
      res.json({
        message: 'user modified',
      });
    }
  } catch (error) {
    next(error);
  }
};

const userPutCurrent = async (
    req: Request<{}, {}, PutUser>,
    res: Response,
    next: NextFunction
  ) => {
    try {
        console.log((req.user as User).user_id)
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = errors
          .array()
          .map((error) => `${error.msg}: ${error.param}`)
          .join(', ');
        throw new CustomError(messages, 400);
      }
      const user = req.body
      const result = await updateUser((req.user as User).user_id, user);
      if (result) {
        res.json({
          message: 'user modified',
        });
      }
    } catch (error) {
      next(error);
    }
  };

// TODO: create userPutCurrent function to update current user
// userPutCurrent should use updateUser function from userModel
// userPutCurrent should use validationResult to validate req.body

const userDelete = async (
    req: Request<{id: number}, {}, {}>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = errors
          .array()
          .map((error) => `${error.msg}: ${error.param}`)
          .join(', ');
        throw new CustomError(messages, 400);
      }
  
      const id = await deleteUser(req.params.id);
      const message: MessageResponse = {
        message: `User with id ${id} deleted`,
      };
      res.json(message);
    } catch (error) {
      next(error);
    }
  };

// TODO: create userDelete function for admin to delete user by id
// userDelete should use deleteUser function from userModel
// userDelete should use validationResult to validate req.params.id
// userDelete should use req.user to get role

const userDeleteCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteUser((req.user as User).user_id);
    if (result) {
      res.json({
        message: 'user deleted',
      });
    }
  } catch (error) {
    next(error);
  }
};

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('token not valid', 403));
  } else {
    res.json(req.user);
  }
};

export {
  userListGet,
  userGet,
  userPost,
  userPut,
  userPutCurrent,
  userDelete,
  userDeleteCurrent,
  checkToken,
};
