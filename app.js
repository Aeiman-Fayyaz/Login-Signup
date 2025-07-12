const supabaseUrl = 'https://hwyofckifjeewvmagsgc.supabase.co';
const supabaseKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3eW9mY2tpZmplZXd2bWFnc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Mzk0MDcsImV4cCI6MjA2NzAxNTQwN30.pvsjYctkRI7NHdJrSuatOb-oLoatl8dIZfHUKv74gvE';

const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);

async function userDisplay() {
	try {
		const {
			data: { user },
			error,
		} = await client.auth.getUser();
		if (error) throw error;
		if (user) {
			const profileAvatar = document.getElementById('profile-avatar');
			const userName = document.getElementById('userName');
			const userEmail = document.getElementById('userEmail');

			if (profileAvatar) {
				profileAvatar.src = user.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp';
			}
			if (userName) {
				userName.textContent = user.user_metadata?.full_name || user.email;
			}
			if (userEmail) {
				userEmail.textContent = user.email;
			}

			if (window.location.pathname.includes('index.html')) {
				window.location.href = 'post.html';
			}
		} else if (!window.location.pathname.includes('index.html') && !window.location.pathname.includes('login.html')) {
			window.location.href = 'index.html';
		}
	} catch (error) {
		console.error('Error in userDisplay:', error);
		if (!window.location.pathname.includes('index.html') && !window.location.pathname.includes('login.html')) {
			window.location.href = 'index.html';
		}
	}
}

// Signup Functionality
const signUpBtn = document.getElementById('SignupBtn');
if (signUpBtn) {
	signUpBtn.addEventListener('click', async () => {
		const userSignupEmail = document.getElementById('signupEmail');
		const userSignupPassword = document.getElementById('signupPassword');

		if (!userSignupEmail?.value || !userSignupPassword?.value) {
			Swal.fire({ icon: 'error', title: 'Oops...', text: 'Please fill all fields' });
			return;
		}

		try {
			const loader = document.getElementById('loader');
			if (loader) loader.style.display = 'block';

			const { error } = await client.auth.signUp({
				email: userSignupEmail.value,
				password: userSignupPassword.value,
			});

			if (error) throw error;

			Swal.fire({ icon: 'success', title: 'Success!', text: 'Account Created' }).then(() => {
				window.location.href = 'login.html';
			});
		} catch (error) {
			console.error('Signup error:', error);
			const loader = document.getElementById('loader');
			if (loader) loader.style.display = 'none';

			if (error.message.includes('invalid format')) {
				Swal.fire({ icon: 'error', title: 'Wrong Credentials', text: 'Enter correct email or password' });
			} else if (error.message.includes('user already registered') || error.message.includes('already exists')) {
				Swal.fire({ icon: 'error', title: 'Email Exists', text: 'This email is already registered' });
			} else {
				Swal.fire({ icon: 'error', title: 'Oops...', text: 'Signup failed. Please try again.' });
			}
		}
	});
}

// Login Functionality
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
	loginBtn.addEventListener('click', async () => {
		const userLoginEmail = document.getElementById('loginEmail');
		const userLoginPassword = document.getElementById('loginPassword');

		if (!userLoginEmail?.value || !userLoginPassword?.value) {
			Swal.fire({ icon: 'error', title: 'Oops...', text: 'Please fill all fields' });
			return;
		}

		try {
			const loader = document.getElementById('loader');
			if (loader) loader.style.display = 'block';

			const { error } = await client.auth.signInWithPassword({
				email: userLoginEmail.value,
				password: userLoginPassword.value,
			});

			if (loader) loader.style.display = 'none';
			if (error) throw error;

			window.location.href = 'post.html';
		} catch (error) {
			console.error('Login error:', error);
			if (error.message.includes('Invalid user credentials')) {
				Swal.fire({ icon: 'error', title: 'Login failed', text: 'Wrong email or password' });
			} else {
				Swal.fire({ icon: 'error', title: 'Error', text: 'Login failed. Please try again.' });
			}
		}
	});
}

// Google OAuth
const googleBtn = document.getElementById('google-btn');
if (googleBtn) {
	googleBtn.addEventListener('click', async () => {
		await client.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: window.location.origin + '/post.html',
				queryParams: { access_type: 'offline', prompt: 'consent' },
			},
		});
	});
}

// Logout Functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
	logoutBtn.addEventListener('click', async () => {
		try {
			await client.auth.signOut();
			window.location.href = 'index.html';
		} catch (error) {
			console.error('Logout error:', error);
			Swal.fire({ icon: 'error', title: 'Logout Failed', text: 'Please try again' });
		}
	});
}

// Post Management
let posts = [];
let currentLocation = null;

function formatDate(isoString) {
	const date = new Date(isoString);
	return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function resetForm() {
	const postForm = document.getElementById('postForm');
	const mediaPreview = document.getElementById('mediaPreview');
	const locationPreview = document.getElementById('locationPreview');

	if (postForm) postForm.reset();
	if (mediaPreview) mediaPreview.innerHTML = '';
	if (locationPreview) locationPreview.innerHTML = '';
	currentLocation = null;
}

function renderPostMedia(post) {
	if (!post.mediaType) return '';

	switch (post.mediaType) {
		case 'image':
			return `<img src="${post.mediaUrl}" class="post-media" alt="Post image">`;
		case 'video':
			return `<video controls class="post-media"><source src="${post.mediaUrl}" type="video/mp4"></video>`;
		case 'file':
			return `<a href="#" class="post-file uploaded-file" data-filename="${post.mediaUrl}"><i class="bi bi-file-earmark"></i> ${post.mediaUrl}</a>`;
		default:
			return '';
	}
}

function renderPosts() {
	const postsFeed = document.getElementById('postsFeed');
	if (!postsFeed) return;

	postsFeed.innerHTML = '';

	if (posts.length === 0) {
		postsFeed.innerHTML = '<p class="text-center">No posts yet. Create your first post!</p>';
		return;
	}

	posts.forEach((post) => {
		const postElement = document.createElement('div');
		postElement.className = 'card post-card mb-3';
		postElement.innerHTML = `
            <div class="card-body">
                <p class="card-text">${post.content}</p>
                ${renderPostMedia(post)}
                ${
									post.location
										? `<div class="location-badge mt-2"><i class="bi bi-geo-alt"></i> ${post.location.name}</div>`
										: ''
								}
                <div class="text-muted small mt-2">${formatDate(post.createdAt)}</div>
                <div class="post-actions">
                    <button class="edit-btn" onclick="openEditPost(${
											post.id
										})"><i class="bi bi-pencil"></i> Edit</button>
                    <button class="dlt-btn" onclick="deletePost(${post.id})"><i class="bi bi-trash"></i> Delete</button>
                </div>
            </div>`;
		postsFeed.appendChild(postElement);
	});
}

function savePostsToStorage() {
	localStorage.setItem('socialMediaPosts', JSON.stringify(posts));
}

function loadPostsFromStorage() {
	const savedPosts = localStorage.getItem('socialMediaPosts');
	if (savedPosts) {
		try {
			posts = JSON.parse(savedPosts);
		} catch (error) {
			console.error('Error parsing saved posts:', error);
			posts = [];
		}
	}
	renderPosts();
}

function createPost() {
	const postContent = document.getElementById('postContent');
	if (!postContent) return;

	const content = postContent.value.trim();
	if (!content) {
		Swal.fire({ icon: 'error', title: 'Oops...', text: 'Post content cannot be empty!' });
		return;
	}

	const mediaPreview = document.getElementById('mediaPreview');
	let mediaType = null;
	let mediaUrl = null;

	if (mediaPreview?.children.length > 0) {
		const mediaElement = mediaPreview.firstChild;
		if (mediaElement.tagName === 'IMG') {
			mediaType = 'image';
			mediaUrl = mediaElement.src;
		} else if (mediaElement.tagName === 'VIDEO') {
			mediaType = 'video';
			mediaUrl = mediaElement.src;
		} else if (mediaElement.classList.contains('uploaded-file')) {
			mediaType = 'file';
			mediaUrl = mediaElement.getAttribute('data-filename');
		}
	}

	const newPost = {
		id: Date.now(),
		content,
		mediaType,
		mediaUrl,
		location: currentLocation,
		createdAt: new Date().toISOString(),
	};

	posts.unshift(newPost);
	savePostsToStorage();
	renderPosts();
	resetForm();

	Swal.fire({
		position: 'top-end',
		icon: 'success',
		title: 'Post created!',
		showConfirmButton: false,
		timer: 1500,
	});
}

function updatePost() {
	const editPostId = document.getElementById('editPostId');
	const editPostContent = document.getElementById('editPostContent');

	if (!editPostId || !editPostContent) return;

	const postId = parseInt(editPostId.value);
	const newContent = editPostContent.value.trim();

	const postIndex = posts.findIndex((post) => post.id === postId);
	if (postIndex !== -1) {
		posts[postIndex].content = newContent;
		savePostsToStorage();
		renderPosts();

		Swal.fire({
			position: 'top-end',
			icon: 'success',
			title: 'Post updated!',
			showConfirmButton: false,
			timer: 1500,
		});
	}

	const modal = bootstrap.Modal.getInstance(document.getElementById('editPostModal'));
	if (modal) modal.hide();
}

function deletePost(postId) {
	Swal.fire({
		title: 'Are you sure?',
		text: "You won't be able to revert this!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, delete it!',
	}).then((result) => {
		if (result.isConfirmed) {
			posts = posts.filter((post) => post.id !== postId);
			savePostsToStorage();
			renderPosts();
			Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
		}
	});
}

function previewMedia(input, type) {
	const mediaPreview = document.getElementById('mediaPreview');
	if (!mediaPreview) return;

	mediaPreview.innerHTML = '';

	if (input.files && input.files[0]) {
		const file = input.files[0];
		const reader = new FileReader();

		reader.onload = function (e) {
			if (type === 'image') {
				const img = document.createElement('img');
				img.src = e.target.result;
				img.style.maxWidth = '100%';
				img.style.maxHeight = '200px';
				mediaPreview.appendChild(img);
			} else if (type === 'video') {
				const video = document.createElement('video');
				video.src = e.target.result;
				video.controls = true;
				video.style.maxWidth = '100%';
				mediaPreview.appendChild(video);
			} else if (type === 'file') {
				const fileElement = document.createElement('div');
				fileElement.className = 'uploaded-file';
				fileElement.setAttribute('data-filename', file.name);
				fileElement.innerHTML = `<i class="bi bi-file-earmark"></i> ${file.name}`;
				mediaPreview.appendChild(fileElement);
			}
		};

		reader.readAsDataURL(file);
	}
}

function getLocation() {
	const locationPreview = document.getElementById('locationPreview');
	if (!locationPreview) return;

	if (!navigator.geolocation) {
		locationPreview.innerHTML = '<div class="text-danger">Geolocation not supported</div>';
		return;
	}

	locationPreview.innerHTML = '<div class="text-muted">Getting location...</div>';

	navigator.geolocation.getCurrentPosition(
		(position) => {
			currentLocation = {
				lat: position.coords.latitude,
				lng: position.coords.longitude,
				name: 'Your Current Location',
			};
			locationPreview.innerHTML = `<div class="location-badge"><i class="bi bi-geo-alt"></i> ${currentLocation.name}</div>`;
		},
		(error) => {
			locationPreview.innerHTML = '<div class="text-danger">Location access denied</div>';
			console.error('Geolocation error:', error);
		},
	);
}

function openEditPost(postId) {
	const post = posts.find((p) => p.id === postId);
	if (!post) return;

	const editPostId = document.getElementById('editPostId');
	const editPostContent = document.getElementById('editPostContent');
	const editPostModal = document.getElementById('editPostModal');

	if (editPostId && editPostContent && editPostModal) {
		editPostId.value = post.id;
		editPostContent.value = post.content;
		new bootstrap.Modal(editPostModal).show();
	}
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async function () {
	// Check for OAuth redirect
	if (window.location.hash.includes('access_token')) {
		try {
			const {
				data: { session },
			} = await client.auth.getSession();
			if (session) window.location.href = 'post.html';
		} catch (error) {
			console.error('Session check error:', error);
		}
	}

	// Check user authentication
	if (!window.location.pathname.includes('index.html') && !window.location.pathname.includes('login.html')) {
		await userDisplay();
	}

	// Load posts
	loadPostsFromStorage();

	// Set up event listeners
	const postForm = document.getElementById('postForm');
	if (postForm) {
		postForm.addEventListener('submit', function (e) {
			e.preventDefault();
			createPost();
		});
	}

	const editPostForm = document.getElementById('editPostForm');
	if (editPostForm) {
		editPostForm.addEventListener('submit', function (e) {
			e.preventDefault();
			updatePost();
		});
	}

	// Media upload handlers
	const imageUpload = document.getElementById('imageUpload');
	if (imageUpload) {
		imageUpload.addEventListener('change', function () {
			previewMedia(this, 'image');
		});
	}

	const videoUpload = document.getElementById('videoUpload');
	if (videoUpload) {
		videoUpload.addEventListener('change', function () {
			previewMedia(this, 'video');
		});
	}

	const fileUpload = document.getElementById('fileUpload');
	if (fileUpload) {
		fileUpload.addEventListener('change', function () {
			previewMedia(this, 'file');
		});
	}
});

window.openEditPost = openEditPost;
window.deletePost = deletePost;
