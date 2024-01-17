window.onload = function () {
    fetchPosts();
};
function fetchPosts() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/posts');
    xhr.setRequestHeader('Authorization', 'Bearer ' +
        localStorage.getItem('jwtToken'));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var posts = JSON.parse(xhr.responseText);
            displayPosts(posts);
        }
    };
    
    xhr.send();
}


function displayPosts(posts) {
    var userId = JSON.parse(atob(localStorage.getItem('jwtToken').split('.')[1])).userId;
    var postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = ''; // Clear existing posts

    posts.forEach(post => {
        var postElement = document.createElement('div');
        var isLikedByUser = post.likesBy.includes(userId);
        var showFollowButton = post.userId !== userId; // Check if the post is not created by the current user
    
        postElement.classList.add('card');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <div class="button-section">
                ${showFollowButton ? `<button class="follow-btn" data-user-id="${post.userId}" onclick="toggleFollow('${post.userId}')">Follow</button>` : ''}
                <button class="like-btn" onclick="likePost('${post._id}')" ${isLikedByUser ? 'data-liked="true"' : ''}>
                    <i class="${isLikedByUser ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <span id="likes-${post._id}" class="like-count">${post.likes} likes</span>
                <button class="comment-btn" onclick="commentOnPost('${post._id}')">Comment</button>
                <button class="share-btn" onclick="sharePost('${post._id}')">Share</button>
                ${post.userId === userId ?
                    `<button class="edit-btn" onclick="editPost('${post._id}')">Edit</button>
                     <button class="delete-btn" onclick="deletePost('${post._id}')">Delete</button>` : ''}
            </div>
            <hr>
            <div class="comment-section">
                <textarea id="comment-${post._id}" placeholder="Add a comment"></textarea>
                <button class="comment-btn" onclick="commentOnPost('${post._id}')">Comment</button>
            </div>
            <p>Comments:</p>
            <div id="comments-${post._id}"></div>
        `;
        postsContainer.appendChild(postElement);
    
        // Display existing comments
        displayComments(post._id, post.comments);
    });
}



function likePost(postId) {
    fetch(`http://localhost:3000/posts/${postId}/like`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to like post. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(updatedPost => {
            console.log('Post liked successfully:', updatedPost);
            document.getElementById(`likes-${postId}`).innerText = `${updatedPost.likes} likes`;
        })
        .catch(error => {
            console.error('Error liking post:', error);
        });
}

function commentOnPost(postId) {
    var commentText = document.getElementById(`comment-${postId}`).value;

    fetch(`http://localhost:3000/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
    })
        .then(response => response.json())
        .then(updatedPost => {
            displayComments(postId, updatedPost.comments); // Display all comments
        })
        .catch(error => {
            console.error('Error adding comment:', error);
        });
}

function displayComments(postId, comments) {
    var commentsContainer = document.getElementById(`comments-${postId}`);
    commentsContainer.innerHTML = ''; // Clear existing comments

    comments.forEach(comment => {
        var commentElement = document.createElement('div');
        commentElement.innerHTML = `
            <p><strong>${comment.username}:</strong> ${comment.text}</p>
            <hr>`;
        commentsContainer.appendChild(commentElement);
    });
}
function sharePost(postId) {
    const shareableLink = generateShareableLink(postId);
    alert('Share this link: ' + shareableLink);
}

function generateShareableLink(postId) {
    // Replace 'your_domain' with your actual domain or base URL
    const baseURL = 'https://your_domain.com';
    return `${baseURL}/post/${postId}`;
}

function editPost(postId) {
    localStorage.setItem('editPostId', postId);
    window.location.href = 'edit-post.html';
}
function deletePost(postId) {
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', 'http://localhost:3000/posts/' + postId, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' +
        localStorage.getItem('jwtToken'));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                alert('Post deleted successfully');
                window.location.reload(); // Reload the posts
            } else {
                alert('Error deleting post');
            }
        }
    };
    xhr.send();
}


// Function to check if the current user is following another user
// Update the toggleFollow function and add new functions for follow/unfollow

// Function to toggle follow/unfollow
function toggleFollow(userId) {
    const isFollowing = isUserFollowing(userId);

    if (isFollowing) {
        unfollowUser(userId);
    } else {
        followUser(userId);
    }
}

// Function to check if the current user is following another user
function isUserFollowing(userId) {
    // Replace with your logic to check if the user is following
    // This might involve making a request to your backend
    return /* true or false */;
}


function followUser(userId) {
    fetch(`http://localhost:3000/follow/${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to follow user. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(responseJson => {
        console.log('Followed user successfully:', responseJson);
        updateFollowStatus(true, userId);
    })
    .catch(error => {
        console.error('Error following user:', error);
    });
}


function unfollowUser(userId) {
    fetch(`http://localhost:3000/unfollow/${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to unfollow user. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(responseJson => {
        console.log('Unfollowed user successfully:', responseJson);
        updateFollowStatus(false, userId);
    })
    .catch(error => {
        console.error('Error unfollowing user:', error);
    });
}


// Function to update the follow button text and status
// Function to update the follow button text and status
function updateFollowStatus(isFollowing, userId) {
    const followButton = document.querySelector(`button[data-user-id="${userId}"]`);

    if (followButton) {
        if (isFollowing) {
            followButton.innerText = 'Following';
            followButton.style.backgroundColor = '#4CAF50'; // Green color
            document.getElementById('followStatus').innerText = 'Following';
        } else {
            followButton.innerText = 'Follow';
            followButton.style.backgroundColor = ''; // Remove background color
            document.getElementById('followStatus').innerText = 'Follow';
        }

        // Add check for already following
        if (isFollowing && followButton.innerText === 'Following') {
            followButton.innerText = 'Following Already';
        }
    }
}
