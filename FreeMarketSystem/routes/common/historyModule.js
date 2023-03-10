const uuid = require("uuid");

const historyModel = require("../model/history");

const history_module = {};

history_module.addHistory = async (data) => {
    /*
    * viewer, history_to
    * */

    const historyWrite = await new historyModel({
        history_id: "history:" + uuid.v4(),
        ...data,
        post_date: new Date()
    }).save();
};

history_module.loadHistory = async (filter) => {
    return await historyModel
        .find({userid: filter.userid})
        .sort("-post_date")
        .skip(filter.start_at)
        .limit(filter.count)
        .exec();
}

module.exports = history_module;