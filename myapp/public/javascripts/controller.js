function searchPlaylist(categoryID){
    const list = document.getElementById('container');
    fetch('/searchPlaylists/'+categoryID).then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        list.innerHTML = ''; //clear element
        data.items.forEach(playlist => {
            let cols = document.createElement('div');
            let card = document.createElement('div');
            let cover = document.createElement('img');
            let cardBody = document.createElement('div');
            let title = document.createElement('h5');
            let description = document.createElement('p');

            cols.setAttribute('class', 'col-sm-12 col-lg-3 col-md-6 my-3 mx-auto');
            card.setAttribute('class', 'card h-100 mx-auto');
            card.setAttribute('style', 'max-width: 16rem;');
            cover.setAttribute('src', playlist.images[0].url);
            cover.setAttribute('alt', 'Playlist cover');
            cover.setAttribute('class', 'card-img-top px-3 py-3');
            cardBody.setAttribute('class', 'card-body pt-0');
            title.setAttribute('class', 'card-text');
            description.setAttribute('class', 'text-truncate');

            title.innerText = playlist.name;
            description.innerText = playlist.description;

            cardBody.appendChild(title);
            cardBody.appendChild(description);
            card.appendChild(cover);
            card.appendChild(cardBody);
            cols.appendChild(card);
            list.appendChild(cols);
        });
    });
}