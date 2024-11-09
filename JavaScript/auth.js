document.addEventListener('DOMContentLoaded', () => {
    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const username = document.getElementById('username').value;

            if (localStorage.getItem(email)) {
                alert('User already exists');
            } else {
                // const hashedPassword = await bcrypt.hash(password, 10);
                const user = { email, password, username };
                localStorage.setItem(email, JSON.stringify(user));
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                alert('Signup successful');
                window.location.href = 'index.html';
            }
        });
    }
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const storedUser = JSON.parse(localStorage.getItem(email));

            if (storedUser && password == storedUser.password) {
                alert('Login successful');
                localStorage.setItem('loggedInUser', JSON.stringify(storedUser));
                window.location.href = 'index.html';
            } else {
                alert('Invalid email or password');
            }
        });
    }
});