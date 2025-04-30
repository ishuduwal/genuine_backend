import Stats from "../model/Stats.js";

export const getStats = async (req, res) => {
    try {
        const stats = await Stats.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStatById = async (req, res) => {
    try {
        const stat = await Stats.findById(req.params.id);
        if (!stat) {
            return res.status(404).json({ success: false, message: 'Stat not found' });
        }
        res.status(200).json({ success: true, data: stat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createStat = async (req, res) => {
    try {
        const { value, title } = req.body;
        const newStat = new Stats({ value, title });
        await newStat.save();
        res.status(201).json({ success: true, data: newStat });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateStat = async (req, res) => {
    try {
        const { value, title } = req.body;
        const updatedStat = await Stats.findByIdAndUpdate(
            req.params.id,
            { value, title },
            { new: true, runValidators: true }
        );
        if (!updatedStat) {
            return res.status(404).json({ success: false, message: 'Stat not found' });
        }
        res.status(200).json({ success: true, data: updatedStat });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteStat = async (req, res) => {
    try {
        const deletedStat = await Stats.findByIdAndDelete(req.params.id);
        if (!deletedStat) {
            return res.status(404).json({ success: false, message: 'Stat not found' });
        }
        res.status(200).json({ success: true, data: deletedStat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};