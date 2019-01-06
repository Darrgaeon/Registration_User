module.exports = (function () {
    const request = require("./ajax/view");

    const transitionDuration = 400;

    const statusCodes = {
        ok: 0,
        checkFunctionError: 1,
        invalidCheck: 2
    };

    function init(response) {
        const userList = response;

        let functionBinds = {
            isLoginInDB: username => request.isUserInDatabase(userList, username),
            isEmailInDB: email => request.isEmailInDatabase(userList, email)
        };

        const $formRegistration = $("#formRegistration");
        if ($formRegistration.length) {
            const $inputs = $formRegistration.find("input");
            const $passwordsInputs = $inputs.filter("[type=password]");
            const $submitButton = $formRegistration.find("[type=submit]");

            if ($passwordsInputs.length > 1) {
                functionBinds.isPasswordsAreSimilar = () => {
                    const passwords = $passwordsInputs.map(function () {
                        return $(this).val();
                    });

                    let result = true;

                    if (passwords.length) {
                        const firstItem = passwords[0];

                        for (let i = 0; i < passwords.length; i++) {
                            if (passwords[i] !== firstItem) {
                                result = false;
                                break;
                            }
                        }
                    }

                    // Because if `true` receives in handler describe
                    // that in function was an error,
                    // `false` if no errors
                    //
                    // simply just invert result
                    return !result;
                }
            }

            function renderStatusMessage(inputNode, statusCode) {
                const $input = $(inputNode);
                const $status = $input.parent().children("span").first();
                const prevStatusCode = $status.data("status");
                const isValid = statusCode === 0;

                if (prevStatusCode !== statusCode) {
                    $status.data("status", statusCode);

                    const statusMessage = $input.data(`status-${statusCode}`);

                    $status.fadeOut(transitionDuration, function () {
                        $(this)
                            .removeClass(isValid ? "error" : "success")
                            .text(statusMessage)
                            .addClass(isValid ? "success" : "error")
                            .fadeIn(transitionDuration);
                    });
                }
            }

            function inputValidation(value, options) {
                const {regexString, checkFunction} = options;
                const regex = new RegExp(regexString);

                const isInputValid = () => {
                    if (regexString) {
                        return value.search(regex) !== -1;
                    }

                    return true;
                };

                if (!(value && isInputValid())) {
                    return statusCodes.invalidCheck;
                }

                if (functionBinds[checkFunction]) {
                    if (functionBinds[checkFunction](value)) {
                        return statusCodes.checkFunctionError
                    }
                }

                return statusCodes.ok;
            }

            function validateInputs() {
                $inputs.each(function () {
                    const regexString = $(this).data("regex");
                    const checkFunction = $(this).data("check-function");
                    const inputValue = $(this).val();

                    renderStatusMessage(this, inputValidation(inputValue, {
                        regexString,
                        checkFunction
                    }))
                });
            }

            function setButtonDisableStatus() {
                const isAnyError = $formRegistration.find("span.error").length !== 0;
                $submitButton.attr("disabled", !isAnyError);
            }

            function render() {
                validateInputs();
                setButtonDisableStatus();
            }

            render();
            $inputs.on("keyup", render);
        }
    }

    request.getUsersList(null, {
        success: init
    });
})();
