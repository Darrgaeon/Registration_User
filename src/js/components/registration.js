module.exports = (function () {
    const md5 = require("./md5");
    const transitionDuration = 400;
    let similarityCheck = true;
    let success = false;

    let inputsStatus = {
        inputLoginCheck: false,
        inputPasswordCheck: false,
        inputPassword2Check: false,
        inputEmailCheck: false
    };

    const $loginInput = $("#login");
    const $passwordInput = $("#password");
    const $password2Input = $("#password-check");
    const $emailInput = $("#email");
    const regexInvalidPasswordSymbols = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/g;


    function test($input, isValid, similarityCheck) {

        if ($input === $loginInput) {
            if (isValid) {
                console.log("Неверный  логин");
                $input.next().hide().text("Неверный  логин").css("color", "red").fadeIn(transitionDuration);
                $input.removeClass().addClass("inputRed form-control");
            } else if (similarityCheck) {
                console.log("Такой логин уже есть!");
                $input.next().hide().text("Такой логин уже есть!").css("color", "red").fadeIn(transitionDuration);
                $input.removeClass("inputGreen").addClass("inputRed");
            } else  {
                console.log("Логин одобрен");
                $input.next().hide().text("Логин одобрен").css("color", "green").fadeIn(transitionDuration);
                $input.removeClass("inputRed").addClass("inputGreen");
            }
        } else if ($input === $passwordInput) {
            console.log("победа!");
            if (isValid) {
                console.log("Неверный  пароль");
                $input.next().hide().text("Неверный  пароль").css("color", "red").fadeIn(transitionDuration);
                $input.removeClass().addClass("inputRed form-control");
            } else {
                $passwordInput.next().hide().text("Пароль одобрен").css("color", "green").fadeIn(transitionDuration);
                $passwordInput.removeClass("inputRed").addClass("inputGreen");
            }
        } else if ($input === $password2Input) {
            if (isValid) {
                $input.next().hide().text("Пароль совпадает").css("color", "green").fadeIn(transitionDuration);
                $input.removeClass("inputRed").addClass("inputGreen");

            } else {
                console.log("Пароль не совпадает!");
                $input.next().hide().text("Пароль не совпадает!").css("color", "red").fadeIn(transitionDuration);
                $input.removeClass().addClass("inputRed form-control");
            }
        } else if ($input === $emailInput) {
            if (isValid) {
                console.log("Неверная почта");
                $input.next().hide().text("Неверная почта").css("color", "red").fadeIn(transitionDuration);
                $input.removeClass().addClass("inputRed form-control");
            } else if (similarityCheck) {
                console.log("Такая почта уже есть!");
                $input.next().hide().text("Такая почта уже есть!").css("color", "red").fadeIn(transitionDuration);
                $input.removeClass("inputGreen").addClass("inputRed");
            } else  {
                console.log("Почта одобрена");
                $input.next().hide().text("Почта одобрена").css("color", "green").fadeIn(transitionDuration);
                $input.removeClass("inputRed").addClass("inputGreen");
            }
        }
    }


    //проверка логина
    $loginInput.change(function () {
        let login = $loginInput.val();
        
        const regexInvalidLoginSymbols = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/g;
        const regexInvalidLoginResult = login.search(regexInvalidLoginSymbols);
        let isLoginValid = regexInvalidLoginResult === -1;

        if (isLoginValid) {
            console.log("isLoginValid", isLoginValid);
            test($loginInput, isLoginValid);
            isLoginValid = false;
        } else {
            (function GetUsers() {
                $.ajax({
                    url: "/api/users",
                    type: "GET",
                    contentType: "application/json",
                    success: function (users) {
                        if (users.length === 0) {
                            success = true;
                            test($loginInput, isLoginValid);
                            changeButtonState();
                        }

                        $(users).each(function (index, user) {

                            if (user.login === login) {
                                test($loginInput, isLoginValid, similarityCheck);

                                changeButtonState();
                                return false;
                            } else {
                                success = true;
                                test($loginInput, isLoginValid);
                                inputsStatus.inputLoginCheck = true;
                                changeButtonState();
                            }
                        });
                    }
                });
            })();
        }
    });


    //проверка пароля
    $passwordInput.change(function () {

        let password = $passwordInput.val();
        const regexInvalidPasswordResult = password.search(regexInvalidPasswordSymbols);

        let isPasswordValid = regexInvalidPasswordResult === -1;

        if (isPasswordValid) {
            test($passwordInput, isPasswordValid)
        } else {
            test($passwordInput);
            inputsStatus.inputPasswordCheck = true;
            changeButtonState();
        }
    });

    //проверка пароля
    $password2Input.change(function () {
        let password = $passwordInput.val();
        let password2 = $password2Input.val();

        const regexInvalidPassword2Result = password.search(regexInvalidPasswordSymbols);

        let isPasswordValid = regexInvalidPassword2Result !== -1;
        let isPasswordComparison = password === password2;
        let isPasswordResult = isPasswordValid === true && isPasswordComparison === true;

        if (isPasswordResult) {
            test($password2Input, isPasswordComparison);
        } else {
            test($password2Input);
            inputsStatus.inputPassword2Check = true;
            changeButtonState();
        }
    });


    //проверка почты
    $emailInput.change(function () {
        let email = $emailInput.val();
        let regexInvalidEmailSymbols = /^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/g;
        let regexInvalidEmailResult = email.search(regexInvalidEmailSymbols);

        let isEmailValid = regexInvalidEmailResult === -1;

        if (isEmailValid) {
            test($emailInput, isEmailValid);
            $emailInput.next().hide().text("Неверная почта").css("color", "red").fadeIn(transitionDuration);
            $emailInput.removeClass().addClass("inputRed form-control");
        } else {
            (function GetUsers() {
                $.ajax({
                    url: "/api/users",
                    type: "GET",
                    contentType: "application/json",
                    success: function (users) {
                        if (users.length === 0) {
                            test($emailInput, isEmailValid);
                            // $emailInput.next().hide().text("Логин одобрен").css("color", "green").fadeIn(transitionDuration);
                            // $emailInput.removeClass("inputRed").addClass("inputGreen");
                            // inputsStatus.inputEmailCheck = true;
                            changeButtonState();
                        }

                        $.each(users, function (index, user) {

                            if (user.email === email) {
                                test($emailInput, isEmailValid, similarityCheck);
                                // $emailInput.next().hide().text("Такая почта уже есть!").css("color", "red").fadeIn(transitionDuration);
                                // $emailInput.removeClass("inputGreen").addClass("inputRed");
                                return false;
                            } else {
                                test($emailInput, isEmailValid);
                                // $emailInput.next().hide().text("Почта одобрена").css("color", "green").fadeIn(transitionDuration);
                                // $emailInput.removeClass("inputRed").addClass("inputGreen");

                                inputsStatus.inputEmailCheck = true;
                                changeButtonState();
                            }
                        });
                    }
                });
            })();
        }
    });


    function changeButtonState() {
        if (inputsStatus.inputEmailCheck
            && inputsStatus.inputPasswordCheck
            && inputsStatus.inputPassword2Check
            && inputsStatus.inputLoginCheck) {

            $("#submit").prop("disabled", false);
        } else {
            $("#submit").attr("disabled", true);
        }
    }


    // отправка формы
    $("#formRegistration").submit(function (e) {
        e.preventDefault();
        let login = this.elements["login"].value;
        let password = md5(this.elements["password"].value);
        let email = this.elements["email"].value;

        CreateUser(login, password, email);
    });


    // Добавление пользователя
    function CreateUser(login, password, email) {
        console.log("ajax1");
        $.ajax({
            url: "/api/users",
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
