import express from 'express';
import bodyParser from 'body-parser';
import apiRoutes from './routes/index';

const PORT = process.env.PORT || 5000;
const api = express();

// Middleware to parse JSON and URL-encoded request bodies
api.use(bodyParser.json({limit: '50mb'}));
api.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

apiRoutes(api);

api.listen(PORT, () => {
  console.log(`server running at port: ${PORT}`);
});
