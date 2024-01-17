function loginUser() {
    var data = {
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
    };
    if (data.username.trim() === "" || data.password.trim() === "") {
        alert("Username and password cannot be empty!");
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            console.log(response.token)
            localStorage.setItem('jwtToken', response.token);
            window.location.href = 'view-posts.html';
        }
    };
    xhr.send(JSON.stringify(data));
}