import express from 'express';
import apiRoutes from './routes/index.js';

const PORT = process.env.PORT || 5000;
const api = express();

apiRoutes(api);

api.listen(PORT, () => {
  console.log(`server running at port: ${PORT}`);
});
