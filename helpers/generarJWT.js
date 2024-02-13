import jwt from "jsonwebtoken"

const generarJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
    }) // .sign() nos permite generar un json web token
}
export default generarJWT