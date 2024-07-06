import express from 'express';
import { ErrorMiddleware } from './modules/common/errors/error.middleware';
import JoiValidation from './modules/common/joi-validation/joi-validation';
import { userSignUpSchema } from './modules/identity/payloads/user-signup.request.payload';

const app = express();
const port = 3000;
app.use(express.json());

const joiValidation = new JoiValidation();

app.get('/', (req, res) => {
  res.send('Hello, TypeScript!');
});

app.post('/', (req, res) => {
  console.log(req.body);
  const validatedData = joiValidation.extractAndValidate<typeof userSignUpSchema>(req.body, userSignUpSchema);
  res.send(validatedData);
});

app.use(ErrorMiddleware);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
