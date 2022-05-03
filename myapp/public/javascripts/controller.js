/*function searchPlaylist(categoryID){
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = () => {
        if(xhttp.readyState === 4 && xhttp.status === 200){
            return xhttp.responseText;
        }
    }

    xhttp.open('GET', '/searchPlaylists/'+categoryID, true);
    xhttp.send();
} */

function searchPlaylist(categoryID){
    const list = document.getElementById('catList');
    fetch('/searchPlaylists/'+categoryID).then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        data.items.forEach(playlist => {
            list.innerText += playlist.description;
        });
    });
}