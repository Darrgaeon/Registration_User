// prevent babel from losing this
// this should be window object
function init() {
    this.$ = require("jquery/dist/jquery");
    this.jQuery = this.$;

    require("svg4everybody/dist/svg4everybody")();

    $(document).ready(function () {
        // require("./components/registration");
        require("./components/registrationForm");
    });
}

init.bind(window)();
