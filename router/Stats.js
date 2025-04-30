import express from 'express';
import {
    getStats,
    getStatById,
    createStat,
    updateStat,
    deleteStat
} from '../controller/Stats.js';

const statsRouter = express.Router();

statsRouter.get('/', getStats);
statsRouter.get('/:id', getStatById);
statsRouter.post('/', createStat);
statsRouter.put('/:id', updateStat);
statsRouter.delete('/:id', deleteStat);

export default statsRouter;