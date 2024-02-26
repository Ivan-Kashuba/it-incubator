import { app } from './app';
import { runMongoDb } from './db/mongoDb';
import { envConfig } from './shared/helpers/env-config';
app.set('trust proxy', true);
const startApp = async () => {
  await runMongoDb();
  app.listen(envConfig.PORT, () => {
    console.log(`Example app listening on port ${envConfig.PORT}`);
  });
};

startApp();
