// Modal Popup functionality
(function($) {
    $.fn.extend({
        leanModal: function(options) {
            var defaults = {
                top: 50,
                overlay: 0.5,
                closeButton: null
            };
            var overlay = $("<div id='lean_overlay'></div>");
            $("body").append(overlay);
            options = $.extend(defaults, options);
            return this.each(function() {
                var o = options;
                $(this).click(function(e) {
                    var modal_id = $(this).attr("href");
                    $("#lean_overlay").click(function() {
                        close_modal(modal_id);
                    });
                    $(o.closeButton).click(function() {
                        close_modal(modal_id);
                    });
                    var modal_height = $(modal_id).outerHeight();
                    var modal_width = $(modal_id).outerWidth();
                    $("#lean_overlay").css({
                        "display": "block",
                        opacity: 0
                    });
                    $("#lean_overlay").fadeTo(200, o.overlay);
                    $(modal_id).css({
                        "display": "block",
                        "position": "fixed",
                        "opacity": 0,
                        "z-index": 11000,
                        "left": 50 + "%",
                        "margin-left": -(modal_width / 2) + "px",
                        "top": o.top + "px"
                    });
                    $(modal_id).fadeTo(200, 1);
                    e.preventDefault();
                });
            });

            function close_modal(modal_id) {
                $("#lean_overlay").fadeOut(200);
                $(modal_id).css({
                    "display": "none"
                });
                // Show the register form
                $(".user_register").show();
                $(".social_login").hide();
                $(".user_login").hide();
                $(".header_title").text('Register');
            }
        }
    });
})(jQuery);

$("#modal_trigger").leanModal({
    top: 100,
    overlay: 0.6,
    closeButton: ".modal_close"
});

$(function() {
    // Calling Login Form
    $("#login_form").click(function() {
        $(".social_login").hide();
        $(".user_login").show();
        return false;
    });

    // Calling Register Form
    $("#register_form").click(function() {
        $(".social_login").hide();
        $(".user_register").show();
        $(".header_title").text('Register');
        return false;
    });

    // Calling Reset Password Form
    $("#forgot_password_link").click(function() {
        $(".social_login").hide();
        $(".user_login").hide();
        $(".user_register").hide();
        $(".reset_password_form").show();
        $(".header_title").text('Reset Password');
        return false;
    });

    // Going back to Social Forms
    $(".back_btn").click(function() {
        $(".user_login").hide();
        $(".user_register").hide();
        $(".reset_password_form").hide();
        $(".social_login").show();
        $(".header_title").text('Login');
        return false;
    });

    // Terms and Conditions Link
    $('#terms_link').on('click', function(event) {
        event.preventDefault();
        $('#lean_overlay').show();
        $('#terms_modal').show();
    });

    $('.modal_close, #terms').on('click', function() {
        // If terms checkbox is checked, update the checkbox in the register form
        if ($('#terms').is(':checked')) {
            $('#terms').prop('checked', true);
        }
        $('#lean_overlay').hide();
        $('#terms_modal').hide();
        // Show the register form
        $(".user_register").show();
        $(".social_login").hide();
        $(".user_login").hide();
        $(".header_title").text('Register');
    });
});

function registerUser() {
    var full_name = $("#full_name").val().trim();
    var email = $("#email").val().trim();
    var password = $("#password").val().trim();
    var terms = $("#terms").is(':checked');

    // Client-side validation
    if (full_name === "" || email === "" || password === "" || !terms) {
        $('#registerFeedback').show().text('All fields are required and you must agree to the Terms and Conditions').addClass('error');
        scrollToFeedback('registerFeedback');
        return false; // Prevent the form from submitting
    }

    $.ajax({
        url: 'http://127.0.0.1:5000/register',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            full_name: full_name,
            email: email,
            password: password,
            receive_updates: terms
        }),
        success: function(response) {
            $('#registerFeedback').show();
            if (response.status === 'success' && response.user) {
                sessionStorage.setItem('userName', response.user.name);
                sessionStorage.setItem('userEmail', response.user.email);
                window.location.href = 'indexlogged.html';
            } else {
                $('#registerFeedback').text(response.message).removeClass('error').addClass('success');
                scrollToFeedback('registerFeedback');
            }
        },
        error: function(xhr) {
            $('#registerFeedback').show();
            var errorMsg = JSON.parse(xhr.responseText).message;
            $('#registerFeedback').text('Error registering: ' + errorMsg).removeClass('success').addClass('error');
            scrollToFeedback('registerFeedback');
        }
    });
}

function loginUser() {
    var email = $('#login_email').val().trim();
    var password = $('#login_password').val().trim();

    // Client-side validation
    if (email === "" || password === "") {
        $('#loginFeedback').show().text('Email and password are required').addClass('error');
        scrollToFeedback('loginFeedback');
        return false; // Prevent the form from submitting
    }

    $.ajax({
        url: 'http://127.0.0.1:5000/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email: email, password: password }),
        success: function(response) {
            $('#loginFeedback').show();
            if (response.status === 'success' && response.user) {
                sessionStorage.setItem('userName', response.user.name);
                sessionStorage.setItem('userEmail', response.user.email);
                window.location.href = 'indexlogged.html';
            } else {
                $('#loginFeedback').text(response.message).removeClass('success').addClass('error');
                scrollToFeedback('loginFeedback');
            }
        },
        error: function(xhr) {
            $('#loginFeedback').show();
            var errorMsg = JSON.parse(xhr.responseText).message;
            $('#loginFeedback').text('Error logging in: ' + errorMsg).removeClass('success').addClass('error');
            scrollToFeedback('loginFeedback');
        }
    });
}

function resetPassword() {
    var email = $('#reset_email').val().trim();
    var newPassword = $('#new_password').val().trim();
    var confirmPassword = $('#confirm_password').val().trim();

    // Client-side validation
    if (email === "" || newPassword === "" || confirmPassword === "") {
        $('#resetPasswordFeedback').show().text('All fields are required').addClass('error');
        scrollToFeedback('resetPasswordFeedback');
        return false; // Prevent the form from submitting
    }

    if (newPassword !== confirmPassword) {
        $('#resetPasswordFeedback').show().text('Passwords do not match').addClass('error');
        scrollToFeedback('resetPasswordFeedback');
        return false; // Prevent the form from submitting
    }

    $.ajax({
        url: 'http://127.0.0.1:5000/reset_password',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email: email, password: newPassword }),
        success: function(response) {
            $('#resetPasswordFeedback').show();
            if (response.status === 'success') {
                $('#resetPasswordFeedback').text('Password has been reset successfully').removeClass('error').addClass('success');
                $('.reset_password_form').hide();
                $('.user_login').show();
                scrollToFeedback('resetPasswordFeedback');
            } else {
                $('#resetPasswordFeedback').text(response.message).removeClass('success').addClass('error');
                scrollToFeedback('resetPasswordFeedback');
            }
        },
        error: function(xhr) {
            $('#resetPasswordFeedback').show();
            var errorMsg = JSON.parse(xhr.responseText).message;
            $('#resetPasswordFeedback').text('Error: ' + errorMsg).removeClass('success').addClass('error');
            scrollToFeedback('resetPasswordFeedback');
        }
    });
}

function scrollToFeedback(feedbackId) {
    document.getElementById(feedbackId).scrollIntoView({ behavior: 'smooth', block: 'center' });
}
