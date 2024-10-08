async function registerUser(event) {
    event.preventDefault();
    try {
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        if (!username || !email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const data = await response.json();
        alert('Registration successful!');
    } catch (error) {
        alert(`Error registering user: ${error.message}`);
    }
}

async function loginUser(event) {
    event.preventDefault();
    try {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const data = await response.json();
        alert(data.message);

        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            alert('Redirecting to index.html...');
            window.location.href = 'index.html'; // Redirect to index.html after successful login
        }
    } catch (error) {
        alert(`Error logging in: ${error.message}`);
    }
}

// Add event listeners to the forms
document.getElementById('register-form').addEventListener('submit', registerUser);
document.getElementById('login-form').addEventListener('submit', loginUser);

function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    alert('Logged out successfully.');
    window.location.href = 'login.html';
}

async function uploadCertificates(event) {
    event.preventDefault();
    try {
        const fileInput = document.getElementById('csv-file');
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        if (!fileInput.files[0].name.endsWith('.csv')) {
            alert('Please upload a CSV file.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not logged in. Redirecting to login page...');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('http://localhost:5000/api/certificates/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        alert(`Error uploading certificates: ${error.message}`);
    }
}

async function verifyCertificate() {
    try {
        const hash = document.getElementById('certificate-hash').value;

        const response = await fetch(`http://localhost:5000/api/certificates/verify/${hash}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const data = await response.json();
        if (data.certificate) {
            alert(`Certificate found: ${data.certificate.courseName} issued to ${data.certificate.studentEmail}`);
        } else {
            alert('Certificate not found or invalid hash.');
        }
    } catch (error) {
        alert(`Error verifying certificate: ${error.message}`);
    }
}

// Function to load user profile and certificates
async function loadUserProfile() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You are not logged in. Redirecting to login page...');
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    
    if (data.username) {  // Use username if available
        document.getElementById('profile-email').innerText = data.username; // Display username
        loadCertificates(); // Load certificates after user info
    } else {
        alert('Failed to load profile.');
    }
}

function getStoredToken() {
    return localStorage.getItem('token');
}

function redirectToLogin() {
    alert('You are not logged in. Redirecting to login page...');
    window.location.href = 'login.html';
}

async function fetchUserProfile(token) {
    const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response;
}

function displayUserProfile(user) {
    document.getElementById('profile-email').innerText = user.email;
}

function displayError(message) {
    alert(message);
}

function logError(error) {
    console.error(error);
}

if (window.location.pathname.endsWith('profile.html')) {
    loadUserProfile();
}

function updateProfileLink() {
    const userId = localStorage.getItem('userId');
    const profileLink = document.getElementById('profile-link');
    const logoutButton = document.getElementById('logout-button');

    if (userId) {
        profileLink.href = `profile.html?userId=${userId}`;
        profileLink.textContent = 'Profile';
        logoutButton.style.display = 'inline-block';
    } else {
        profileLink.href = 'login.html';
        profileLink.textContent = 'Login';
        logoutButton.style.display = 'none';
    }
}

updateProfileLink();
