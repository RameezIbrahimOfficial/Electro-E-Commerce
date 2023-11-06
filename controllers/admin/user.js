const { customerModel } = require('../../Model');

const getUserManagement = async (req, res) => {
    try {
        const users = await customerModel.find({});
        res.render("page-users", { users });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const getUserBlock = async (req, res) => {
    try {
        id = req.query.id;
        const user = await customerModel.findOne({ _id: id });
        await customerModel.updateOne(
            { _id: id },
            { $set: { isBlocked: true } }
        );
        res.redirect("/admin/admin_panel/user_management");
    } catch (error) {
        console.error(error)
    }
}

const getUserUnblock = async (req, res) => {
    try {
        id = req.query.id;
        const user = await customerModel.findOne({ _id: id });
        if (user.isBlocked) {
            await customerModel.updateOne(
                { _id: id },
                { $set: { isBlocked: false } }
            );
            res.redirect("/admin/admin_panel/user_management");
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = { getUserManagement, getUserBlock, getUserUnblock };