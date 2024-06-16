document.addEventListener('DOMContentLoaded', function () {
    // Handle sign-up form submission
    const signUpForm = document.getElementById('sign-up-form');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const responseDiv = document.createElement('div');
            responseDiv.setAttribute('id', 'response');
            signUpForm.appendChild(responseDiv);
            responseDiv.innerHTML = 'Creating user...'; // Indicate loading state

            try {
                const response = await fetch('https://20dotpyrgj.execute-api.us-east-1.amazonaws.com/production/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        username: username,
                        password: password
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    responseDiv.innerHTML = `<div class="alert alert-success">User created successfully: ${data.message.Item.email}</div>`;
                } else {
                    const errorText = await response.text();
                    responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${response.status} - ${errorText}</div>`;
                }
            } catch (error) {
                responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
            }
        });
    }

    // Handle sign-in form submission
    const signInForm = document.getElementById('sign-in-form');
    if (signInForm) {
        signInForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const responseDiv = document.createElement('div');
            responseDiv.setAttribute('id', 'response');
            signInForm.appendChild(responseDiv);
            responseDiv.innerHTML = 'Logging in...'; // Indicate loading state

            try {
                const response = await fetch(`https://20dotpyrgj.execute-api.us-east-1.amazonaws.com/production/user?userid=${email}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.message.password === password) {
                        // Store user information in localStorage
                        localStorage.setItem('loggedInUser', JSON.stringify({ email: data.message.email, username: data.message.username }));

                        // Redirect to another page (e.g., dashboard.html)
                        window.location.href = 'dashboard.html';
                    } else {
                        responseDiv.innerHTML = '<div class="alert alert-danger">Error: Incorrect password</div>';
                    }
                } else {
                    const errorText = await response.text();
                    responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${response.status} - ${errorText}</div>`;
                }
            } catch (error) {
                responseDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
            }
        });
    }
});
