const body = document.querySelector('body'),
sidebar = body.querySelector('nav'),
toggle = body.querySelector(".toggle"),
searchBtn = body.querySelector(".search-box"),
modeSwitch = body.querySelector(".toggle-switch"),
modeText = body.querySelector(".mode-text"),
openSidebar = body.querySelector('.sidebarOpen');


toggle.addEventListener("click" , () =>{
sidebar.classList.toggle("close");
sidebar.classList.toggle("visible");
})

searchBtn.addEventListener("click" , () =>{
sidebar.classList.remove("close");
})

openSidebar.addEventListener("click" , () =>{
  sidebar.classList.remove("close");
  sidebar.classList.add("visible");
})

modeSwitch.addEventListener("click" , () =>{
body.classList.toggle("dark");

if(body.classList.contains("dark")){
  modeText.innerText = "Light mode";
}else{
  modeText.innerText = "Dark mode";
  
}
});