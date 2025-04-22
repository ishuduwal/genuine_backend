
import express from 'express';
import { 
    createFacility, 
    getFacilities, 
    getFacility, 
    updateFacility, 
    deleteFacility 
} from '../controller/Facility.js';

const facilityRouter = express.Router();

facilityRouter.post('/', createFacility);
facilityRouter.get('/', getFacilities);
facilityRouter.get('/:id', getFacility);
facilityRouter.put('/:id', updateFacility);
facilityRouter.delete('/:id', deleteFacility);

export default facilityRouter;