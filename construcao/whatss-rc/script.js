
// Definindo a rotação automatica das imagens do container 1 
let count = 1;
document.getElementById("radio1").checked = true;

setInterval( function(){
    nextImage();
}, 3000)

function nextImage(){
    count++;
    if(count>4){
        count = 1;
    } 

document.getElementById("radio"+count).checked = true;

}


// Definindo o rolamento do botão de subir ao topo da pagina 

window.addEventListener('scroll', function() {
    let scroll = this.document.querySelector('.scrollTop')
        scroll.classList.toggle('active', window.scrollY > 450)
})

function backTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}