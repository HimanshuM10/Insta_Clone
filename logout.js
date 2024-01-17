function logoutUser() {
    localStorage.removeItem('jwtToken');
    console.log('Logout successful. User logged out.');
    window.location.href = 'login.html';
}