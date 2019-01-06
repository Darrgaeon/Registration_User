const config = require("../../../../etc/config");

function sendApiRequest(ajaxParams) {
    return $.ajax({
        url: config.api,
        contentType: "application/json",
        ...ajaxParams,

        data: ajaxParams.data
    });
}

function registerUser(params, ajaxParams) {
    return sendApiRequest({
        method: "POST",
        data: JSON.stringify(params),
        ...ajaxParams
    });
}

function getUsersList(params, ajaxParams) {
    return sendApiRequest({
        method: "GET",
        data: JSON.stringify(params),
        ...ajaxParams
    });
}

function isValueEqualToRow(database=[], value, row) {
    let result = false;

    for (let i = 0; i < database.length; i++) {
        if (database[i][row] === value) {
            result = true;

            break;
        }
    }

    return result;
}

function isUserInDatabase(database, login) {
    return isValueEqualToRow(database, login, "login");
}

function isEmailInDatabase(database, email) {
    return isValueEqualToRow(database, email, "email");
}

module.exports = {
    getUsersList,
    registerUser,
    isUserInDatabase,
    isEmailInDatabase
};
