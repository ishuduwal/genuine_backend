import MissionVision from '../model/MissionVision.js';

// Create MissionVision (only one document should exist)
export const createMissionVision = async (req, res) => {
    try {
        const { overview, whoWeAre, mission, vision, overviewTitle, whoWeAreTitle, missionvisionTitle } = req.body;
        
        // Check if document already exists
        const existing = await MissionVision.findOne();
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'MissionVision already exists. Use update instead.'
            });
        }

        const missionVision = new MissionVision({
            overview,
            whoWeAre,
            mission,
            vision,
            overviewTitle, 
            whoWeAreTitle, 
            missionvisionTitle
        });

        await missionVision.save();
        res.status(201).json({
            success: true,
            data: missionVision
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get MissionVision
export const getMissionVision = async (req, res) => {
    try {
        const missionVision = await MissionVision.findOne();
        res.status(200).json({
            success: true,
            data: missionVision || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update MissionVision
export const updateMissionVision = async (req, res) => {
    try {
        const { overview, whoWeAre, mission, vision, overviewTitle, whoWeAreTitle, missionvisionTitle } = req.body;
        const missionVision = await MissionVision.findById(req.params.id);

        if (!missionVision) {
            return res.status(404).json({
                success: false,
                message: 'MissionVision not found'
            });
        }

        missionVision.overview = overview || missionVision.overview;
        missionVision.whoWeAre = whoWeAre || missionVision.whoWeAre;
        missionVision.mission = mission || missionVision.mission;
        missionVision.vision = vision || missionVision.vision;
        missionVision.overviewTitle = overviewTitle || missionVision.overviewTitle;
        missionVision.whoWeAreTitle = whoWeAreTitle || missionVision.whoWeAreTitle;
        missionVision.missionvisionTitle = missionvisionTitle || missionVision.missionvisionTitle;

        await missionVision.save();

        res.status(200).json({
            success: true,
            data: missionVision
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};