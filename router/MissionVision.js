import express from 'express';
import {
    createMissionVision,
    getMissionVision,
    updateMissionVision
} from '../controller/MissionVision.js';

const missionvisionRouter = express.Router();

missionvisionRouter.post('/', createMissionVision);
missionvisionRouter.get('/', getMissionVision);
missionvisionRouter.put('/:id', updateMissionVision);

export default missionvisionRouter;