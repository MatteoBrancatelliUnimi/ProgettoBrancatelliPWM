document.addEventListener('DOMContentLoaded', ()=>{
    const input = document.getElementById('inputArtists');
    let list = document.getElementById('resArtists');
    input.addEventListener('keyup', () => {
      //dl.innerHTML = '';
      var filter = input.value;
      if(filter == '' && !list.hasChildNodes()) list.innerHTML = '';
      else sendSearch(filter);
    }); 
  });

  function sendSearch(filter){
    var list = document.getElementById('resArtists');
    //var listItems = list.getElementsByClassName('list-group-item-success');
    var listItems = list.querySelectorAll('li:not(.list-group-item-success)');
    for(i=0; i<listItems.length; i++){
      listItems[i].remove();
    }
    fetch('/search/'+filter).then(results => {
      return results.json();
    })
    .then(data => {
      data.items.forEach(result => {
        //check if the result is not yet in the list
        var isPresent = document.getElementById(result.id);
        
        if(isPresent == null){
          let listItem = document.createElement('li');
          listItem.innerText = result.name;
          listItem.setAttribute('class', 'list-group-item');
          listItem.setAttribute('onclick', 'selectArtist(this)');
          listItem.setAttribute('id', result.id);
          list.appendChild(listItem);
        }

      });
    });
  }
function selectArtist(elem){
  var list = document.getElementById('resArtists');
  elem.classList.add('list-group-item-success');
  list.prepend(elem);
  elem.removeAttribute('onclick');

  let closeBtn = document.createElement('button');
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('class', 'btn-close float-end');
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.setAttribute('onclick', 'removeArtist(this.parentNode)');
  elem.appendChild(closeBtn);

  document.getElementById('inputArtists').value = '';
  var listItems = list.querySelectorAll('li:not(.list-group-item-success)');
    for(i=0; i<listItems.length; i++){
      listItems[i].remove();
    }
}

    function updateTextValue(val){
      document.getElementById('rangeValue').textContent = 'La tua playlist sarà formata da '+val+' tracce';
    }

    function removeArtist(elem){
        elem.remove();
    }

    
    function generatePlaylist(){
      var playlistData = {};
      playlistData.title = document.getElementById('inputTitle').value;
      playlistData.description = document.getElementById('inputDescription').value;
      playlistData.numElem = parseInt(document.getElementById('numEl').value);
      playlistData.isPublic = document.getElementById('publicCheck').checked;

    console.log(playlistData);
      //get Artists selected by the user
      var artists = [];
      var lista = document.getElementById('resArtists').getElementsByTagName('li');
      var l = lista.length, i = 0;
      while(i<l){
        artists.push(lista[i].id);
        i++;
      }
      playlistData.artists = artists;

      //Make request 
      fetch('/createPlaylist/'+JSON.stringify(playlistData)).then(response => {
        console.log(response);
        response.json();
      }).then(data => {
        const myModal = new bootstrap.Modal(document.getElementById("myModal"), {});
        let message = document.getElementById('msgBody'); 
        message.innerText = 'La playlist è stata creata correttamente. La puoi trovare nella tua libreria!';
        myModal.show();
        console.log(data);
      });
    }

    function validateForm(){
      //check if form is correctly submitted
      const artistsList = document.getElementById('resArtists');
      const title = document.getElementById('inputTitle');
      if(!artistsList.hasChildNodes()){
        createErrorMessage('Devi selezionare almeno un artista!');
      }else if(title.value === ''){
        console.log('Sono qui');
        createErrorMessage('Devi inserire un titolo per la tua playlist!');
      }else{
        generatePlaylist();
      }
    }

    function createErrorMessage(txt){
      let msg = document.getElementById('errMsg');
      msg.style.display = 'block';
      msg.style.color = 'red';
      msg.style.fontWeight = '700';
      msg.innerText = txt;
    }