import express from "express"; // type:module package.json nos permite usar sintaxis import
import dotenv from "dotenv"; //dontenv nos permite almacenar variables de entorno
import cors from "cors"; // nos permite las conecciones entre frontend
import conectarDB from "./config/db.js"; //importante poner el la extencion (.js) en los archivos creados por nosotros
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";


const app = express();
app.use(express.json()) //con este metodo procesa info tipo json

dotenv.config(); //va a buscar algun archivo .env

conectarDB();

// Configurar CORS
const whitelist = [process.env.FRONTEND_URL] //en esta "listablanca" van todos los dominios que pueden consultar nuestra url 
const corsOptions = {
    origin: function (origin, callback) { //origin es la url que quiere consultar
        if (whitelist.includes(origin)) {
            callback(null, true); //null porque no hay msg de error y damos acceso con true
        } else {
            callback(new Error("Error de cors"));
        }
    }
}
app.use(cors(corsOptions));

// Routing
app.use("/api/usuarios", usuarioRoutes) // .use soporta todos los verbos get, post, delete, etc
app.use("/api/proyectos", proyectoRoutes)
app.use("/api/tareas", tareaRoutes)

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(`Servidor Corriendo en el puerto ${PORT}`); // con nodemon se reinicia solo el servidor
})


//!--------------- CONECTANDO A SOCKET.IO ---------------//

import { Server } from "socket.io"; 

//*-------CONFIGURAMOS SOCKET.IO-------//

const io = new Server(servidor, {   
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

//*-------ABRIMOS CONEXION SOCKET.IO---------//

// io.on("connection", (socket) => {
//     console.log("Conectado a socket.io");
//     // Aqui definimos los eventos de socket.io
//     socket.on("prueba", (proyectos) => { //*recibe evento creado en frontend ("prueba") y sus props(proyectos) y ejecuta console.log
//         console.log(proyectos);
//     })
//     socket.emit("respuesta", {respuesta: "desde backend"}) //* le enviamos info al frontend tambien con emit()
// })
io.on("connection", (socket) => {
    // console.log("Conectado a socket.io");

    socket.on("abrir proyecto", (proyecto) => {
        socket.join(proyecto); //*join() genera un "room" para ese proyecto. De esta forma sabemos que usuario esta en cada "room"
    })

    socket.on("nueva tarea", (tarea) => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit("tarea agregada", tarea)
    });

    socket.on("eliminar tarea", (tarea) => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit("tarea eliminada", tarea)
    })

    socket.on("editar tarea", (tarea) => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit("tarea editada", tarea)
    })

    socket.on("cambiar estado", (tarea) => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit("nuevo estado", tarea)
    })
});
