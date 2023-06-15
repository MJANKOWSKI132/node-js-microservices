import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@cygnetops/common';
import { User } from '../models/user';
import { BadRequestError } from '@cygnetops/common';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password'),
        validateRequest
    ],
    async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return next(new BadRequestError('Invalid login credentials provided'));
    }

    const passwordMatch = await Password.compare(existingUser.password, password);
    if (!passwordMatch) {
        return next(new BadRequestError('Invalid login credentials provided'));
    }

    const userJwt = jwt.sign({
        id: existingUser.id,
        email
    }, process.env.JWT_KEY!);

    req.session = {
        jwt: userJwt
    };

    res.status(200).send(existingUser);
});

export { router as signinRouter };