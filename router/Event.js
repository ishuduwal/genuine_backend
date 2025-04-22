import express from "express";
import { 
  CreateEvent, 
  GetAllEvents, 
  GetEventById, 
  UpdateEvent, 
  DeleteEvent,
  DeleteEventImage
} from "../controller/Event.js";

const eventRouter = express.Router();

eventRouter.post('/', CreateEvent);
eventRouter.get('/', GetAllEvents);
eventRouter.get('/:id', GetEventById);
eventRouter.put('/:id', UpdateEvent);
eventRouter.delete('/:id', DeleteEvent);
eventRouter.delete('/:eventId/images/:imageId', DeleteEventImage);

export default eventRouter;