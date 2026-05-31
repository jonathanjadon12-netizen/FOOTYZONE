const Download = require('../config/models/Download');
const Match = require('../config/models/Match');

exports.triggerDownload = async (req, res, next) => {
  return res.status(403).json({
    status: 'fail',
    message: 'Offline match downloading is completely disabled on FOOTYZONE to protect streaming rights.'
  });
};

exports.getDownloads = async (req, res, next) => {
  try {
    const list = await Download.find({ userId: req.user._id }).populate('matchId');
    res.status(200).json({ status: 'success', data: list });
  } catch (err) {
    next(err);
  }
};
