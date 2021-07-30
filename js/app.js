
// Defino las variables a utilizar

const btnLogIn      = document.getElementById("btnLogin"); //  document.querySelector("#btnLogin");
const btnLogout     = document.getElementById("btnLogout");
const chatContainer = document.getElementById("chatContainer");
const username      = document.getElementById("username");
const useremail     = document.getElementById("useremail");
const mensaje       = document.getElementById("mensaje");
const formulario    = document.getElementById("formulario");


firebase.auth().onAuthStateChanged(user => {
  if(user){
      // Muestro los datos del usuario;
      username.innerHTML  = user.displayName;
      useremail.innerHTML = user.email;
      
      // Modifico los botones para que se vea solo el de cerrar sesion.
      btnLogout.classList.remove('d-none');
      btnLogIn.classList.add('d-none');


      logout();
      chatContent(user);
  }else{
      login()
      console.log('usuario no registrado');

      // Quito los datos y coloco los valores originales
      username.innerHTML = 'Chat';
      useremail.innerHTML = '';
      
      // Agrego una leyenda de iniciar sesion
      chatContainer.innerHTML = /*html*/`
      <p class="lead mt-5 text-center">Debes iniciar sesión</p>
      `;
      
      // Oculto boton de cerrar sesion y habilito el ingreso
      btnLogout.classList.add('d-none');
      btnLogIn.classList.remove('d-none');
  }
});

const logout = () => {
  formulario.classList.remove('d-none')
  btnLogout.addEventListener('click', () => firebase.auth().signOut())
}

const login = () => {
  formulario.classList.add('d-none')
  btnLogIn.addEventListener('click', async() => {
      console.log('entro');
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
          await firebase.auth().signInWithPopup(provider)
      } catch (error) {
          console.log(error)
      }
  })
}

const chatContent = user => {
  chatContainer.innerHTML = '';
  formulario.addEventListener('submit', event => {
      event.preventDefault()
      console.log(mensaje.value)
      if(!mensaje.value.trim()){
          console.log('mensaje vacio')
          return
      }
      firebase.firestore().collection('chat').add({
          mensaje: mensaje.value,
          uid: user.uid,
          fecha: Date.now(),
          emisor: user.displayName,
      }).then(res => {
          console.log('mensaje agregado')
      })
      mensaje.value = ''
  })

  firebase.firestore().collection('chat').orderBy('fecha')
      .onSnapshot(snapshot => {
          snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                  console.log(change.doc.data());
                  console.log(user.uid)
                  console.log(change.doc.data().uid)

                  if (user.uid === change.doc.data().uid) {
                      console.log('entró', change.doc.data().mensaje)
                      chatContainer.innerHTML += `
                      <div class="text-end">
                          <div class="d-inline">
                              <span class="badge badge bg-info">
                                  ${change.doc.data().emisor}
                              </span><br>
                              <small>
                                ${change.doc.data().mensaje}
                              </small>
                          </div>
                      </div>
                      `
                  }else{
                      chatContainer.innerHTML += /*html*/`
                      <div class="text-start">
                           <div class="d-inline">
                              <span class="badge bg-secondary">${change.doc.data().emisor}</span><br>
                              <small>${change.doc.data().mensaje}</small>
                           </div>
                      </div>
                      `
                  }
                  chatContainer.scrollTop = chatContainer.scrollHeight
              }
              if (change.type === "modified") {
                  console.log("Modified city: ", change.doc.data());
              }
              if (change.type === "removed") {
                  console.log("Removed city: ", change.doc.data());
              }
          });
      })
}
