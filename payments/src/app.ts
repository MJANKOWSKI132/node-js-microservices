import express from "express";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUser, errorHandler, NotFoundError } from "@cygnetops/common";
import { createChargeRouter } from "./routes/new";

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);
app.use(currentUser);

app.use(createChargeRouter);

app.all('*', async (req, res, next) => {
  next(new NotFoundError());
})

app.use(errorHandler);

export { app };