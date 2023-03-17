import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  updateCat,
  //getCatsByUser,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import {Cat, PostCat} from '../../interfaces/Cat';
import {User} from '../../interfaces/User';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';
import MessageResponse from '../../interfaces/MessageResponse';

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await getAllCats();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGet = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const cat = await getCat(parseInt(req.params.id));
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

const catPost = async (
    req: Request<{}, {}, PostCat>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const errors = validationResult(req.body);
      if (!errors.isEmpty()) {
        const messages = errors
          .array()
          .map((error) => `${error.msg}: ${error.param}`)
          .join(', ');
        throw new CustomError(messages, 400);
      }
      if (!req.body.filename && req.file) {
        req.body.filename = req.file.filename;
      }
      if (!req.body.lat) {
        req.body.lat = res.locals.coords[0] as number;
      }
      if (!req.body.lng) {
        req.body.lng = res.locals.coords[1] as number;
      }
      if(!req.body.owner) {
        req.body.owner = (req.user as User).user_id;
      }
      const cat = await addCat(req.body);
      
      res.json({
        message: 'cat uploaded',
        id: cat
      });
    } catch (error) {
      next(error);
    }
  };

// TODO: create catPost function to add new cat
// catPost should use addCat function from catModel
// catPost should use validationResult to validate req.body
// catPost should use req.file to get filename
// catPost should use res.locals.coords to get lat and lng (see middlewares.ts)
// catPost should use req.user to get user_id and role

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const cat = req.body;

    const user = req.user as User;
    let result = false;
    let actual_cat;
    if(user.role == 'admin'){
        result = await updateCat(
            id,
            cat,
        );
    } else if (user.role == 'user'){
        let cat_for_checking = await getCat(id)
        let number_to_check_user_id
        if(cat_for_checking.owner !== undefined) {
            console.log("lajdngljsd")
            number_to_check_user_id = typeof(cat_for_checking.owner) === 'number' ? cat_for_checking.owner : cat_for_checking.owner.user_id
        }
        if(user.user_id === number_to_check_user_id){
            result = await updateCat(
                id,
                cat,
            );
        } else {
            throw new CustomError('not allowed to!', 400)
        }
    }
    var message: MessageResponse
    if (result) {
      message = {
        message: 'cat updated',
        id,
      }
    } else {
        message = {
            message: 'cat not updated',
            id,
        }
    };
      res.json(message);
  } catch (error) {
    next(error);
  }
};

const catDelete = async (
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
  
      const id = await deleteCat(req.params.id);
      const message: MessageResponse = {
        message: `Cat with id ${id} deleted`,
      };
      res.json({message, id: id});
    } catch (error) {
      next(error);
    }
  };

// TODO: create catDelete function to delete cat
// catDelete should use deleteCat function from catModel
// catDelete should use validationResult to validate req.params.id

export {catListGet, catGet, catPost, catPut, catDelete};
