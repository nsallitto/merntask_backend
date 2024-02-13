import Usuario from "../models/Usuario.js"
import generarId from "../helpers/generarID.js"
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const registrar = async(req, res) => {
    // ------> Evitar registros duplicados <-------
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({ email }) //findOne trae el primero que encuentre
    
    if (existeUsuario) {
        const error = new Error("Usuario ya Registrado")
        return res.status(400).json({ msg: error.message}) 
    }

    try {
        // ------> Creamos usuario Nuevo <-------
        const usuario = new Usuario(req.body) //crea variable usuario = objeto con el modelo de Usuario y completa con info que enviamos en req.body
        // ------> Agregamos Token al Usuario <-------
        usuario.token = generarId();
        await usuario.save() // .save() sirve para almacenar el obj en la base de datos y lo hacemos await porque no sabemos cuanto va a demorar en almacenar
        //Enviamos email de confirmacion
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token 
        })
        res.json({msg: "Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta"});
    } catch (error) {
        console.log(error);
    }
}
// ------> Autenticamos el Usuario <-------
const autenticar = async(req, res) => {
    const { email, password} = req.body;
    //Comprobamos si el Usuario existe
    const usuario = await Usuario.findOne({ email }) //findOne trae el primero que encuentre
    if (!usuario) {
        const error = new Error("El usuario No existe");
        return res.status(404).json({msg: error.message})
    }
    //Comprobamos si el Usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error("Tu Cuenta no ha sido confirmada")
        return res.status(403).json({msg: error.message})
    }
    //Comprobamos su password y generamos JSON WEB TOKEN
    if (await usuario.comprobarPassword(password)) {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    } else {
        const error = new Error("La contraseña es incorrecta")
        return res.status(403).json({msg: error.message})
    }
}
// ------> Confirmamos el Usuario <-------
const confirmar = async(req, res) => {
    const { token } = req.params
    const usuarioConfirmar = await Usuario.findOne( {token} )
    if (!usuarioConfirmar) {
        const error = new Error("Token no valido")
        return res.status(403).json({msg: error.message})
    }
    try {
        usuarioConfirmar.confirmado = true
        usuarioConfirmar.token = "" //Al confirmar la cuenta dejamos token vacio
        await usuarioConfirmar.save()
        res.json({msg: "Usuario Confirmado Correctamente"})
    } catch (error) {
        console.log(error);
    }
}
// ------> Cambio de Contraseña <-------
const olvidePassword = async (req, res) => {
    const { email } = req.body

    const usuario = await Usuario.findOne({ email })
    if (!usuario) {
        const error = new Error("El usuario no existe")
        res.status(404).json({msg: error.message})
    }
    try {
        usuario.token = generarId() //Le generamos un nuevo token para que confirme su cuenta y configure nva contraseña
        await usuario.save()
        //Enviamos email para cambiar password
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({msg: "Hemos enviado un email con las instrucciones"})
        
    } catch (error) {
        console.log(error);
    }
}
 //comprobamos que el token sea correcto
const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const tokenValido = await Usuario.findOne({ token })
    if (tokenValido) {
        res.json({msg: "Token valido y el Usuario existe"})
    } else {
        const error = new Error("Token no valido")
        return res.status(404).json({msg: error.message})
    }
}

//Almacenando el nuevo Password
const nuevoPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    const usuario = await Usuario.findOne({ token })
    if (usuario) {
        usuario.password = password
        usuario.token = ""
        try {
            await usuario.save()
            res.json({msg: "Password modificado Correctamente"})
        } catch (error) {
            console.log(error);
        }
    } else {
        const error = new Error("Token no valido")
        return res.status(404).json({msg: error.message})
    }

    console.log(token);
    console.log(password);
}
const perfil = async (req, res) => {
    const { usuario } = req;
    res.json(usuario);
}

export { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil }