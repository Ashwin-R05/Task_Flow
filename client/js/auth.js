const API = '/api/auth';

if (localStorage.getItem('token')) window.location.href = 'dashboard.html';

function switchTab(tab) {
    hideAlert();
    document.getElementById('loginForm').classList.toggle('on', tab === 'login');
    document.getElementById('registerForm').classList.toggle('on', tab !== 'login');
    document.getElementById('loginTab').classList.toggle('on', tab === 'login');
    document.getElementById('registerTab').classList.toggle('on', tab !== 'login');
}

function showAlert(msg, type = 'err') {
    const box = document.getElementById('alertBox');
    document.getElementById('alertMsg').textContent = msg;
    box.className = `msg ${type} show`;
}
function hideAlert() { document.getElementById('alertBox').className = 'msg'; }

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    btn.textContent = 'Signing in...'; btn.disabled = true;
    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showAlert('Success! Redirecting...', 'ok');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 400);
    } catch (err) { showAlert(err.message); }
    finally { btn.textContent = 'Sign In'; btn.disabled = false; }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('registerBtn');
    btn.textContent = 'Creating...'; btn.disabled = true;
    try {
        const res = await fetch(`${API}/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('regName').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                organization: document.getElementById('regOrganization').value,
                role: document.getElementById('regRole').value
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showAlert('Account created! Redirecting...', 'ok');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 400);
    } catch (err) { showAlert(err.message); }
    finally { btn.textContent = 'Create Account'; btn.disabled = false; }
}
