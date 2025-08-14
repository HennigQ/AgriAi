import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pino from 'pino';
import bodyParser from 'body-parser';
import { authGuard } from './routes/authGuard.js';
import { weatherRouter } from './routes/weather.js';
import { pricesRouter } from './routes/prices.js';
import { subsRouter } from './routes/subscriptions.js';
import { payfastRouter } from './routes/payfast.js';

const app = express();
const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });

app.use(cors({ origin: (process.env.PUBLIC_APP_URL || '').split(',').filter(Boolean) || true, credentials: true }));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/webhook/payfast', payfastRouter);

app.use('/api', authGuard);
app.use('/api/weather', weatherRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/subscriptions', subsRouter);

const port = Number(process.env.PORT || 8787);
app.listen(port, () => logger.info({ msg: `API listening on :${port}` }));