const supabaseUrl = "https://hwyofckifjeewvmagsgc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3eW9mY2tpZmplZXd2bWFnc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Mzk0MDcsImV4cCI6MjA2NzAxNTQwN30.pvsjYctkRI7NHdJrSuatOb-oLoatl8dIZfHUKv74gvE";

const {createClient} = supabase
const client = createClient(supabaseUrl,supabaseKey)

console.log(createClient);

const loginBtn = document.getElementById("btn")
const userEmail = document.getElementById("email")
const userPassword = document.getElementById("password")

loginBtn.addEventListener("click" , (e) =>{
    let userEmailVal = userEmail.value
    console.log(userEmailVal);
    let userPasswordVal = userPassword.value
    console.log(userPasswordVal);
})
