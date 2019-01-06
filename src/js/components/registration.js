module.exports = (function () {
    const md5 = require("./md5");
    const transitionDuration = 400;

    let inputsStatus = {
        loginCheck: 0,
        passwordCheck: 0,
        password2Check: 0,
        emailCheck: 0
    };


    //проверка логина
    $("#login").change(function () {
        const $loginInput = $("#login");
        let login = $loginInput.val();
        
        const regexInvalidLoginSymbols = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/g;
        const regexInvalidLoginResult = login.search(regexInvalidLoginSymbols);
        const isLoginValid = regexInvalidLoginResult === -1; 

        if (isLoginValid) {
            $loginInput.next().hide().text("Неверный  логин").css("color", "red").fadeIn(transitionDuration);
            $loginInput.removeClass().addClass("inputRed form-control");
        } else {
            (function GetUsers() {
                $.ajax({
                    url: "/api/users",
                    type: "GET",
                    contentType: "application/json",
                    success: function (users) {
                        if (users.length === 0) {
                            const $statusAnyInput = $loginInput.next();
                            $statusAnyInput.hide().text("Логин одобрен").css("color", "green").fadeIn(transitionDuration);

                            $loginInput.removeClass("inputRed").addClass("inputGreen");
                            inputsStatus.loginCheck = 1;

                            changeButtonState();
                        }

                        $(users).each(function (index, user) {
                            console.log("users", users);
                            console.log("user", user);

                            if (user.login === login) {
                                $loginInput.next().hide().text("Такой логин уже есть!").css("color", "red").fadeIn(transitionDuration);
                                $loginInput.removeClass("inputGreen").addClass("inputRed");
                                return false;
                            } else {
                                $loginInput.next().hide().text("Логин одобрен").css("color", "green").fadeIn(transitionDuration);
                                $loginInput.removeClass("inputRed").addClass("inputGreen");
                                inputsStatus.loginCheck = 1;
                                changeButtonState();
                            }
                        });
                    }
                });
            })();
        }
    });


    //проверка пароля
    $("#password").change(function () {
        const IdPassword = $("#password");
        let password = IdPassword.val();
        let expPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/g;
        let resPassword = password.search(expPassword);

        if (resPassword === -1) {
            IdPassword.next().hide().text("Неверный  пароль").css("color", "red").fadeIn(transitionDuration);
            IdPassword.removeClass().addClass("inputRed form-control");
        } else {
            IdPassword.next().hide().text("Пароль одобрен").css("color", "green").fadeIn(transitionDuration);
            IdPassword.removeClass("inputRed").addClass("inputGreen");
            inputsStatus.passwordCheck = 1;
            changeButtonState();
        }
    });

    //проверка пароля
    $("#password-check").change(function () {
        const IdPassword = $("#password");
        let password = IdPassword.val();

        const IdPassword2 = $("#password-check");
        let password2 = IdPassword2.val();

        let expPassword2 = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/g;
        let resPassword2 = password2.search(expPassword2);

        if (resPassword2 !== -1 && password !== password2) {
            IdPassword2.next().hide().text("Неверный  пароль").css("color", "red").fadeIn(transitionDuration);
            IdPassword2.removeClass().addClass("inputRed form-control");
        } else {
            IdPassword2.next().hide().text("Пароль одобрен").css("color", "green").fadeIn(transitionDuration);
            IdPassword2.removeClass("inputRed").addClass("inputGreen");
            inputsStatus.password2Check = 1;
            changeButtonState();
        }
    });


    //проверка почты
    $("#email").change(function () {
        const IdEmail = $("#email");
        let login = IdEmail.val();
        let expEmail = /^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/g;
        let resEmail = login.search(expEmail);

        if (resEmail === -1) {
            IdEmail.next().hide().text("Неверная почта").css("color", "red").fadeIn(transitionDuration);
            IdEmail.removeClass().addClass("inputRed form-control");
        } else {
            (function GetUsers() {
                $.ajax({
                    url: "/api/users",
                    type: "GET",
                    contentType: "application/json",
                    success: function (users) {
                        if (users.length === 0) {
                            IdEmail.next().hide().text("Логин одобрен").css("color", "green").fadeIn(transitionDuration);
                            IdEmail.removeClass("inputRed").addClass("inputGreen");
                            inputsStatus.emailCheck = 1;
                            changeButtonState();
                        }

                        $.each(users, function (index, user) {

                            if (user.email === email) {
                                IdEmail.next().hide().text("Такая почта уже есть!").css("color", "red").fadeIn(transitionDuration);
                                IdEmail.removeClass("inputGreen").addClass("inputRed");
                                return false;
                            } else {
                                IdEmail.next().hide().text("Почта одобрена").css("color", "green").fadeIn(transitionDuration);
                                IdEmail.removeClass("inputRed").addClass("inputGreen");

                                inputsStatus.emailCheck = 1;
                                changeButtonState();
                            }
                        });
                    }
                });
            })();
        }
    });


    function changeButtonState() {
        console.log("changeButtonState");
        if (inputsStatus.emailCheck === 1
            && inputsStatus.passwordCheck === 1
            && inputsStatus.password2Check === 1
            && inputsStatus.loginCheck === 1) {

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
