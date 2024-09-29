import AppController from '../controllers/AppController';

const apiRoutes = (api) => {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);
};

export default apiRoutes;
