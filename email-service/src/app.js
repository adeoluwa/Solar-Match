const express = require('express');
const helmet = require('helmet')
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./shared/config/swagger');
const notFound = require('./shared/middlewares/notFound');
const errorHandler = require('./shared/middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '100kb' }));

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

app.use('/api/v1', require('./routes/v1'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
