module.exports = (function () {
    const md5 = require("./md5");
    const config = require("../../../etc/config");
    const $loginInput = $("#login");
    const $passwordInput = $("#password");
    const $password2Input = $("#password-check");
    const $emailInput = $("#email");
    const regexInvalidPasswordSymbols = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/g;
    const transitionDuration = 400;
    const similarityCheck = true;

    let inputsStatus = {
        inputLoginCheck: false,
        inputPasswordCheck: false,
        inputPassword2Check: false,
        inputEmailCheck: false
    };


    function showMessageAndColorInput($input, message, check = false) {
        const $inputBlock = $input.next().hide().text(message);

        if (check) {
            $inputBlock.css("color", "red").fadeIn(transitionDuration);
            $input.removeClass("inputGreen").addClass("inputRed");
        } else {
            $inputBlock.css("color", "green").fadeIn(transitionDuration);
            $input.removeClass("inputRed").addClass("inputGreen");
        }
    }


    function checkDataToShowMessageAndColor($input, message, isValid = false, similarityCheck = false) {
        if (isValid) {
            showMessageAndColorInput($input, message, isValid);
        } else if (similarityCheck) {
            showMessageAndColorInput($input, message, similarityCheck);
        } else {
            showMessageAndColorInput($input, message);
        }
    }


    function createMessageAndCheckInput($input, isValid, similarityCheck) {
        let message_wrong = `Incorrect `;
        let message_similarity = ``;
        let message_success = `Successfully`;

        if ($input === $loginInput) {
            if (isValid) {
                message_wrong += `login`;
                checkDataToShowMessageAndColor($input, message_wrong, isValid)
            } else if (similarityCheck) {
                message_similarity = `This login is busy`;
                checkDataToShowMessageAndColor($input, message_similarity, isValid, similarityCheck)
            } else {
                checkDataToShowMessageAndColor($input, message_success)
            }
        } else if ($input === $passwordInput) {
            if (isValid) {
                message_wrong += `password`;
                checkDataToShowMessageAndColor($input, message_wrong, isValid)
            } else {
                checkDataToShowMessageAndColor($input, message_success)
            }
        } else if ($input === $password2Input) {
            if (isValid !== true) {
                message_wrong = `Password does not look like`;
                checkDataToShowMessageAndColor($input, message_wrong, true)
            } else {
                checkDataToShowMessageAndColor($input, message_success)
            }
        } else if ($input === $emailInput) {
            if (isValid) {
                message_wrong += `email`;
                checkDataToShowMessageAndColor($input, message_wrong, isValid)
            } else if (similarityCheck) {
                message_similarity = `This email is busy`;
                checkDataToShowMessageAndColor($input, message_similarity, isValid, similarityCheck)
            } else {
                checkDataToShowMessageAndColor($input, message_success)
            }
        }
    }


    //check login
    $loginInput.change(function () {
        let login = $loginInput.val();
        
        const regexInvalidLoginSymbols = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/g;
        const regexInvalidLoginResult = login.search(regexInvalidLoginSymbols);
        let isLoginValid = regexInvalidLoginResult === -1;

        if (isLoginValid) {
            createMessageAndCheckInput($loginInput, isLoginValid);
            inputsStatus.inputLoginCheck = false;
            changeButtonState();
        } else {
            (function GetUsers() {
                $.ajax({
                    url: config.api,
                    type: "GET",
                    contentType: "application/json",
                    success: function (users) {
                        console.log("users", users);
                        if (users.length === 0) {
                            createMessageAndCheckInput($loginInput, isLoginValid);
                            inputsStatus.inputLoginCheck = true;
                            changeButtonState();
                        }

                        $(users).each(function (index, user) {
                            if (user.login === login) {
                                createMessageAndCheckInput($loginInput, isLoginValid, similarityCheck);
                                inputsStatus.inputLoginCheck = false;
                                changeButtonState();
                                return false;
                            } else {
                                createMessageAndCheckInput($loginInput, isLoginValid);
                                inputsStatus.inputLoginCheck = true;
                                changeButtonState();
                            }
                        });
                    }
                });
            })();
        }
    });


    //check password
    $passwordInput.change(function () {

        let password = $passwordInput.val();
        const regexInvalidPasswordResult = password.search(regexInvalidPasswordSymbols);

        let isPasswordValid = regexInvalidPasswordResult === -1;

        if (isPasswordValid) {
            createMessageAndCheckInput($passwordInput, isPasswordValid);
            inputsStatus.inputPasswordCheck = false;
            changeButtonState();
        } else {
            createMessageAndCheckInput($passwordInput);
            inputsStatus.inputPasswordCheck = true;
            changeButtonState();
        }
    });


    //check password2
    $password2Input.change(function () {
        let password = $passwordInput.val();
        let password2 = $password2Input.val();

        const regexInvalidPassword2Result = password.search(regexInvalidPasswordSymbols);

        let isPasswordValid = regexInvalidPassword2Result !== -1;
        let isPasswordComparison = password === password2;
        let isPasswordResult = isPasswordValid === true && isPasswordComparison === true;

        if (isPasswordResult) {
            createMessageAndCheckInput($password2Input, isPasswordComparison);
            inputsStatus.inputPassword2Check = true;
            changeButtonState();
        } else {
            createMessageAndCheckInput($password2Input);
            inputsStatus.inputPassword2Check = false;
            changeButtonState();
        }
    });


    //check email
    $emailInput.change(function () {
        let email = $emailInput.val();
        const regexInvalidEmailSymbols = /^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/g;
        const regexInvalidEmailResult = email.search(regexInvalidEmailSymbols);

        let isEmailValid = regexInvalidEmailResult === -1;

        if (isEmailValid) {
            createMessageAndCheckInput($emailInput, isEmailValid);
            inputsStatus.inputEmailCheck = false;
            changeButtonState();
        } else {
            (function GetUsers() {
                $.ajax({
                    url: config.api,
                    type: "GET",
                    contentType: "application/json",
                    success: function (users) {
                        if (users.length === 0) {
                            createMessageAndCheckInput($emailInput, isEmailValid);
                            inputsStatus.inputEmailCheck = true;
                            changeButtonState();
                        }

                        $.each(users, function (index, user) {
                            if (user.email === email) {
                                createMessageAndCheckInput($emailInput, isEmailValid, similarityCheck);
                                inputsStatus.inputEmailCheck = false;
                                changeButtonState();
                                return false;
                            } else {
                                createMessageAndCheckInput($emailInput, isEmailValid);
                                inputsStatus.inputEmailCheck = true;
                                changeButtonState();
                            }
                        });
                    }
                });
            })();
        }
    });


    //check disabled for submit
    function changeButtonState()  {
        if (inputsStatus.inputEmailCheck && inputsStatus.inputPasswordCheck
            && inputsStatus.inputPassword2Check && inputsStatus.inputLoginCheck) {

            $("#submit").prop("disabled", false);
        } else {
            $("#submit").attr("disabled", true);
        }
    }


    // send form
    $("#formRegistration").submit(function (e) {
        e.preventDefault();
        let login = this.elements["login"].value;
        let password = md5(this.elements["password"].value);
        let email = this.elements["email"].value;

        CreateUser(login, password, email);
    });


    // add user
    function CreateUser(login, password, email) {
        $.ajax({
            url: config.api,
            contentType: "application/json",
            method: "POST",
            data: JSON.stringify({
                login: login,
                password: password,
                email: email,
            })
        });
    }
})();
