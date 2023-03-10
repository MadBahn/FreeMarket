const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    report_id: { type: String, unique: true },
    refer_to: { type: String },
    report_by: { type: String },
    reason: { type: String },
    post_date: { type: Date }
});

const reportModel = mongoose.model('reportModel',
    reportSchema,
    'report');

module.exports = reportModel;