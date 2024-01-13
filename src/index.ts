import { app } from './app';
import { runMongoDb } from './db/mongoDb';
import { PORT } from './shared/helpers/env-constants';

const startApp = async () => {
  await runMongoDb();
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
};

startApp();
