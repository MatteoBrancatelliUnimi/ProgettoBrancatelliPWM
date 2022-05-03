function getCategories(){
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/getCategories', true);
    xhttp.send();
}