import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js";

const checkAuth = async(req, res, next) => {
    let token;
    if (req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")) { //Validamos la autorizacion y si comienza con Bearer (convencion)
        try {
            token = req.headers.authorization.split(" ")[1]; //Con slit() sacamos el bearer. Solo queremos token
            const decoded = jwt.verify(token, process.env.JWT_SECRET) //verify() nos permite leer token (que es un id)
            req.usuario = await Usuario.findById(decoded.id).select("_id nombre email") //buscamos un usuario con ese id. con select() seleccionamos la info que queremos

            return next() //Como no siempre sabemos cual es la sig funcion(sig middleware) nos da el next()
        } catch (error) {
            return res.status(404).json({msg: "Hubo un Error!"})
        }
    }
    if (!token) {
        const error = new Error("Token no valido");
        return res.status(401).json({msg: error.message});
    }
    next()
}
export default checkAuth