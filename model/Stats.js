import mongoose from "mongoose";

const statsSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Stats = mongoose.model('Stats', statsSchema);
export default Stats;