//lo que necesitamos para hacer el juego es el motor del juego (js) que seria las rutinas basicas que permite darle funcionamiento a nuestro
//juego 1 dibujar graficos 2 detectar coliciones y por ultimp animacion 




//Variables globales que define las acciones de los objetos 
var velocidad = 50;
var desplazamiento = 10;
var superficie = 403;//tamaño de la imagen menos la altura del canvas 
var npared = 600;//cantidad de paredes 
var bucle;//este es el que va a estar llamando al cuadro constantemente 
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var ancho = canvas.width;//almacenamos el tamaño del canvas 
var alto = canvas.height;
var modal = document.getElementById("modal");

//Clases
class Objeto {//se refiere a los personajes y a los enemigos 
	constructor(){
		this.img = document.createElement("img");//con esta variable creamos una etiqueta s
	}
	choque(otro){//deteccion de colicion (cuando choca con el enemigo o no)
		if(this.fondo < otro.techo || this.techo > otro.fondo || this.derecha < otro.izquierda || this.izquierda > otro.derecha){
			return false;
		} else {
			return true;
		}// esta condicion verifica lo que esta alrededor del personaje 
	}
}

class Mundo {//esta clase nos crea el mundo del juego 
	constructor(){
		this.x = 0;
		this.y = superficie;
		this.tamano = 15000;//el tamaño del bucle que nos permite jugar 
		this.espacio = 100;//tamaño de la imagen del piso 
		this.img = document.createElement("img");
		this.img.src = "imagenes/mundo.png";
		
		this.imgNube = document.createElement("img");
		this.imgNube.src = "imagenes/nube.png";
		this.nx = 350;
		this.ny = 50;
		this.nd = 250;
	}
	dibujar(){
		var tx = this.x;
		for(var i=0; i<=this.tamano;i++){//el limite del bucle es el tamaño del mundo
			ctx.drawImage(this.img, tx, this.y);//recibe tres parametros por img para dibujar y las pociciones 
			tx+=this.espacio;
		}
		var tnx = this.nx;
		for(var i=0; i<=this.tamano;i++){
			ctx.drawImage(this.imgNube, tnx, this.ny);
			tnx+=this.nd;
		}
	}
	mover(){
		this.x-=desplazamiento;//mueve el mundo se hace global porque los muros tienen que tener el mismo desplazamiento que 
		//el piso  para que se muevan a la misma vez 
		this.nx-=2;
	}
}
class Sonic extends Objeto {//crea nuestro sonic y hereda la clase objeto 
	constructor(){
		super();// cada vez que heredemos alguna clase tenemos que llamar a super si no no anda 
		this.x = 35;// separacion entre pared izquierda
		this.w = 100;//modificamos el tamaño del personaje 
		this.h = 116;
		this.y = superficie-this.h;//damos el punto de salida del personaje 
		this.img.src = "imagenes/sonic.png";
		
		this.techo = this.y;//dimenciones del personaje 
		this.fondo = this.y+this.h-15;
		// definimos el tamaño de los bordes de las dimenciones 
		this.bordeDerecha = 30;
		this.bordeIzquierda = 50;
		this.derecha = this.x+this.w-this.bordeDerecha;
		this.izquierda = this.x+this.bordeIzquierda;
		
	}
	dibujar(){
		ctx.drawImage(this.img, this.x, this.y);
	}
	actualizarBordes(){
		this.techo = this.y;
		this.fondo = this.y+this.h-15;
	}
}

class Pared extends Objeto {
	constructor(x){
		super();
		this.x = x;//se lo pasa al constructor 
		this.hmin = 99;//alturas de las paredes
		this.hmax = 99;
		this.h = this.generar(this.hmin, this.hmax); // genera las alturas de las paredes
		this.w = this.h*(0.1);//proporciona la imagen de la pared 
		this.y = superficie-this.h;//punto de partida de las paredes 
		this.nmin = 1;// cantidad de paredes que van a salir a la vez
		this.nmax = 3;
		this.n = this.generar(this.nmin, this.nmax);//n° aleatorio de paredes 
		this.dmin = 300;//distancia entre paredes 
		this.dmax = 250;
		this.d = this.generar(this.dmin, this.dmax);//n° aletorio de distancia entre paredes 
		this.siguiente = null;//detectar coliciones 
		this.img.src = "imagenes/pared.png";
		
		this.techo = this.y;
		this.fondo = this.y+this.h;
		this.derecha = this.x+this.w;
		this.izquierda = this.x;
	}
	dibujar(){
		var tx = this.x;
		for(var i=0;i<this.n;i++){//si le colocamos desde 1 nos generara 1 a 4 paredes 
			ctx.drawImage(this.img, tx, this.y, this.w, this.h);//parametros del ancho, alto, imagen y posiciones 
			tx+=this.w;//ubicacion de las paredes 
			this.derecha = tx;
		}
		if(this.siguiente != null){
			this.siguiente.dibujar();
		}
	}
	mover(){// se mueven las paredes 
		this.x-=desplazamiento;//se mueve al mismo tiempo que nuestro mundo 
		this.izquierda = this.x;
		if(this.siguiente != null){
			this.siguiente.mover();
		}
	}
	agregar(){
		if(this.siguiente == null){// va agregando mas paredes 
			this.siguiente = new Pared(this.x+this.d);// calcula la distancia aleatoria 
		} else{
			this.siguiente.agregar();
		}
	}
	generar(a,b){
		return Math.floor((Math.random() * b) + a);//calcula el tamaño de la pared 
	}
	verSiguiente(){
		return this.siguiente;
	}
}
class Tiempo {
	constructor(){
		this.nivel = 0;
		this.tiempo = 0;
		this.limite = 10000;
		this.intervalo = 1000/velocidad;
		
		this.sonido = document.createElement("audio");// crea un elemento audio
		this.sonido.src = "imagenes/aviso.mp3";// suena cada vez que pasamos de nivel 
	}
	dibujar(){
		ctx.font = "25px Arial";
		ctx.fillText(this.nivel.toString(), 550, 40);// aparecera el numero de nivel sobre los ejes  x e y 
	}
	
	tick(){
		this.tiempo+=this.intervalo;
		if(this.tiempo >= this.limite){
			this.tiempo = 0;
			this.nivel++;
			this.sonido.play();//se reproduce el sonido 
			velocidad-=3;
			velocidadSalto-=2;//aumenta la velocidad del salto 
			this.intervalo = Math.floor(1000/velocidad);//para que no quede decimales en el tiempo 
			clearInterval(bucle);
			bucle = setInterval("frame()", velocidad);
		}
	}
	
}
//Objetos
var mundo = new Mundo();
var sonic = new Sonic();
var pared = new Pared(600);//pociciones iniciales 
for(i=0;i<=npared;i++){
	pared.agregar();
}//se ejecuta 600 veces y agrega las paredes 
var tiempo;


//funciones de controlpara los saltos del personaje
var velocidadSalto = 30;
var desplazamientoSalto = 30;
var puedeSaltar = true;//condicion de cuando puede saltar y cuando no
var salto;
function subir(){
	sonic.y-=desplazamientoSalto;//la velocidad del desplazamiento 
	sonic.actualizarBordes();
	if(sonic.y <=2 ){// altura del salto condicion 
		clearInterval(salto);
		salto = setInterval("bajar()", velocidadSalto);
	}
}
function bajar(){
	sonic.y+=desplazamientoSalto;
	sonic.actualizarBordes();
	if(sonic.y >= (superficie-sonic.h)){//cuando llega a la superficie puede saltar 
		clearInterval(salto);
		puedeSaltar = true;
	}
}
function iniciarSalto(){
	salto = setInterval("subir()", velocidadSalto);//saltara con el valor de velocidadsalto
	puedeSaltar = false;//no puede saltar 
}
function saltar(event){//en esta condicion sabemos que si se  apreta la tecla con el codigo 38 el personaje saltara 
	if(event.keyCode == 38){
		if(puedeSaltar){
			iniciarSalto();
		}
	}
}

//function mover(event){ //para que se mueva el sonic 
	//if(event.keycode)


//}




function findeJuego(){
	clearInterval(bucle);
	modal.style.display = "block";
	document.getElementById("imgbtn").src = "imagenes/otravez.png";
	mundo = new Mundo();//vuelve  a crear todo otra vez cuando finaliza 
	sonic = new Sonic();
	velocidad = 50;
	velocidadSalto = 25;//define la velocidad del salto 
	pared = new Pared(600);
	for(i=0;i<=npared;i++){
	pared.agregar();
	}
}
function choquePared(){
	var temp = pared;
	while(temp != null){//apareceran las paredes y luego se volvera a recetear el puntaje, tiempo  
		if(temp.choque(sonic)){
			//fin de juego
			findeJuego();
			break;
		} else {
			temp = temp.verSiguiente();
		}
	}
}
function destruirPared(){
	if(pared.derecha < 0){
		pared = pared.verSiguiente();//elimina las paredes una vez que las pasamos
	}
}
//funciones globales
function dibujar(){
	ctx.clearRect(0,0,ancho, alto);//limpia la pantalla 
	mundo.dibujar();
	sonic.dibujar();
	pared.dibujar();
	tiempo.dibujar();
}
function frame(){//este va ser llamado constantemente por bucle 
	dibujar();
	mundo.mover();
	pared.mover();//se mueve igual que cada cuadro 
	tiempo.tick();
	choquePared();// verifica el choque(colision)
	destruirPared();
}
function iniciar(){
	modal.style.display = "none";//con esto ocultamos nuestro modal 
	bucle = setInterval("frame()", velocidad);//el setInterval es como un blucle pero pausado 
	tiempo = new Tiempo();//inicia el tiempo cuando se pone play 
}

