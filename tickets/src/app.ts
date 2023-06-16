import express from "express";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError } from "@cygnetops/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

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

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res, next) => {
  next(new NotFoundError());
})

app.use(errorHandler);

export { app };