import express from 'express';
import { ErrorMiddleware } from './modules/common/errors/error.middleware';
import identityRouter from './routes/identity.routes';
import BaseDatastore from './modules/common/datastore/base-datastore';
import dotenv from 'dotenv';
import { userSignupRequestPayload } from './modules/identity/payloads/user-signup.request.payload';

dotenv.config();
const port = process.env.PORT;
const app = express();
app.use(express.json());

new BaseDatastore().initializeDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  });

app.use('/api/identity', identityRouter);

app.use(ErrorMiddleware);