const supabaseUrl = "https://hwyofckifjeewvmagsgc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3eW9mY2tpZmplZXd2bWFnc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Mzk0MDcsImV4cCI6MjA2NzAxNTQwN30.pvsjYctkRI7NHdJrSuatOb-oLoatl8dIZfHUKv74gvE";

const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);

console.log(createClient);

const loginBtn = document.getElementById("btn");
const userEmail = document.getElementById("email");
const userPassword = document.getElementById("password");
const signUp = document.getElementById("signUp");

signUp && signUp.addEventListener("click", function () {
    const signupEmail = document.getElementById("emailSignup");
    const signupPass = document.getElementById("passwordCreate");
    if (signupEmail && signupPass) {
      console.log(signupEmail, signupPass);
      async function sigupUser() {
        try {
          const loader = document.getElementById("loader");
          loader.style.display = "block";
          const { data, error } = await client.auth.signUp({
            email: signupEmail.value,
            password: signupPass.value,
          });
          loader.style.display = "none";
          console.log(data);
          // navigate to login page
          window.location.href = "index.html";
        } catch (error) {
          console.log(error.message);
          switch (error.message) {
            case "Unable to validate email address: invalid format":
              console.log("hello");
              alert("please give us the right format of email address");
              break;
          }
        }
      }
      sigupUser();
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please Filled all these fields",
      });
    }
  });

loginBtn && loginBtn.addEventListener("click", function () {
    const loginEmail = document.getElementById("login-email");
    const loginPass = document.getElementById("login-password");

    if (loginEmail && loginPass) {
      console.log(loginEmail, loginPass);

      async function loginUser() {
        try {
          const loader = document.getElementById("loader");
          loader.style.display = "block";
          const { data, error } = await client.auth.signInWithPassword({
            email: loginEmail.value,
            password: loginPass.value,
          });
          loader.style.display = "none";
          if (error) {
            console.log(error.message);
          } else {
            console.log(data);
            alert("user created successsfully");
          }
          // navigate to login page
          window.location.href = "home.html";
        } catch (error) {
          console.log(error);
          console.log(error.message);

          switch (error.message) {
            case "Unable to validate email address: invalid format":
              console.log("hello");
              alert("please give us the right format of email address");
              break;
          }
        }
      }
      loginUser();
    } 
    else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please Filled all these fields",
      });
    }
  });

// Google Button
const googleBtn = document.getElementById("google-btn");
console.log(googleBtn);
googleBtn.addEventListener("click", async (e) => {
  const data = await client.auth.signInWithOAuth({
    provider: "google",
  });
  console.log(data);
});
