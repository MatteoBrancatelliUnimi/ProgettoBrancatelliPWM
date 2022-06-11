const body = document.querySelector('body'),
sidebar = body.querySelector('nav'),
toggleX = body.querySelector(".toggle-x"),
toggleA = body.querySelector('.toggle-arrow'),
searchBtn = body.querySelector(".search-box"),
modeSwitch = body.querySelector(".toggle-switch"),
modeText = body.querySelector(".mode-text"),
openSidebar = body.querySelector('.sidebarOpen');


toggleX.addEventListener("click" , () =>{
sidebar.classList.toggle("close");
sidebar.classList.toggle("visible");
})

toggleA.addEventListener("click", () => {
  sidebar.classList.toggle('close');
});

searchBtn.addEventListener("click" , () =>{
sidebar.classList.remove("close");
})

openSidebar.addEventListener("click" , () =>{
  sidebar.classList.remove("close");
  sidebar.classList.add("visible");
})

//dark/light mode handler
modeSwitch.addEventListener("click" , () =>{

  if(body.classList.contains('dark')){
    lightMode();
  }else{
    darkMode();
  }
  //body.classList.toggle("dark");


});

var darkmode = localStorage.getItem('darkmode');
if(darkmode == 'yes'){
  darkMode();
}else{
  lightMode();
}

function darkMode(){
  document.getElementsByTagName('body')[0].className = 'dark';
  modeText.innerText = 'Light mode';
  localStorage.setItem('darkmode', 'yes');
}
function lightMode(){
  document.getElementsByTagName('body')[0].className = '';
  modeText.innerText = 'Dark mode';
  localStorage.setItem('darkmode', 'no');
}