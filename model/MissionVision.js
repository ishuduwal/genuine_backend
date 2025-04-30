import mongoose from 'mongoose';

const missionVisionSchema = new mongoose.Schema({
    overview: {
        type: String,
        required: true
    },
    overviewTitle:{
        type:String,
        required:true
    },
    whoWeAre: {
        type: String,
        required: true
    },
    whoWeAreTitle:{
        type:String,
        required:true
    },
    mission: {
        type: String,
        required: true
    },
    vision: {
        type: String,
        required: true
    },
    missionvisionTitle:{
        type:String, 
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const MissionVision = mongoose.model('MissionVision', missionVisionSchema);
export default MissionVision;