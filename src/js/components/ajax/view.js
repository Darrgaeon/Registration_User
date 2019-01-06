const controller = require("./controller");

module.exports = {
    getUsersList: controller.getUsersList,
    register: controller.registerUser,
    isUserInDatabase: controller.isUserInDatabase,
    isEmailInDatabase: controller.isEmailInDatabase
};
