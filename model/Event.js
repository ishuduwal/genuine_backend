import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name:{type:String,
        required:[true, 'event name is required'],
        trim: true
    },
    description:{
        type:String,
        required:[true, 'Event description is required']
    },
    mainImage:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    images:[
        {public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }
    ]
}, {timestamps: true});

const Event = mongoose.model("Event", eventSchema);
export default Event;