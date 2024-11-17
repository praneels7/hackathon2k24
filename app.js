const baseURL = 'http://localhost:3000'; // Backend URL

// Utility function to display messages
const showMessage = (elementId, message, color) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = color;
    } else {
        console.error(`Element with ID '${elementId}' not found.`);
    }
};

// Login Form Submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Ensure fields are not empty
    if (!username || !password) {
        showMessage('loginMessage', 'Error: All fields are required!', 'red');
        return;
    }

    try {
        console.log('Sending login request...');
        const response = await fetch(`${baseURL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Login success
            showMessage('loginMessage', 'Login successful!', 'green');
            console.log('Login successful:', data);

            // Store user details in localStorage (optional)
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to the accounts page
            setTimeout(() => {
                window.location.href = 'accounts.html'; // Replace with the actual accounts page URL
            }, 1000);
        } else {
            // Handle errors from the server
            showMessage('loginMessage', `Error: ${data.error || 'Login failed'}`, 'red');
            console.error('Login failed:', data);
        }
    } catch (error) {
        console.error('Login error:', error); // Log error details
        showMessage('loginMessage', 'Error: Unable to login. Please try again later.', 'red');
    }
});

// Account Registration Form Submission
document.querySelector('.button-primary')?.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default button behavior

    // Get form values
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const accountType = document.getElementById('account-type').value;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !accountType) {
        showMessage('errorMessage', 'Error: All fields are required.', 'red');
        return;
    }

    try {
        console.log('Sending account registration request...', { firstName, lastName, email, password, accountType });

        const response = await fetch(`${baseURL}/submit_registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password, accountType }),
        });

        const data = await response.json();

        if (response.ok) {
            // Account created successfully
            showMessage('errorMessage', 'Account created successfully!', 'green');
            console.log('Account created:', data);

            // Redirect to accounts page after a short delay
            setTimeout(() => {
                window.location.href = 'accounts.html';
            }, 1000);
        } else {
            // Handle server-side validation errors
            showMessage('errorMessage', `Error: ${data.error || 'Unable to create account.'}`, 'red');
            console.error('Server error:', data);
        }
    } catch (error) {
        console.error('Account registration error:', error); // Log error details
        showMessage('errorMessage', 'Error: Unable to create account. Please try again.', 'red');
    }
});

// Load accounts dynamically in accounts.html (if applicable)
if (window.location.pathname.includes('accounts.html')) {
    const loadAccounts = async () => {
        try {
            console.log('Fetching accounts...');
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                console.error('No user logged in!');
                return;
            }

            const response = await fetch(`${baseURL}/accounts?username=${user.username}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const accounts = await response.json();
            const accountsTable = document.getElementById('accounts-data');

            // Populate accounts table dynamically
            accounts.forEach(account => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${account.type}</td>
                    <td>${account.number}</td>
                    <td>${account.balance}</td>
                    <td>${account.lastActivity}</td>
                    <td>
                        <button onclick="viewAccount('${account.number}')">View</button>
                    </td>
                `;
                accountsTable.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const viewAccount = (accountNumber) => {
        console.log(`Viewing account details for: ${accountNumber}`);
        // Add functionality to handle account viewing if needed
    };

    loadAccounts();
}
