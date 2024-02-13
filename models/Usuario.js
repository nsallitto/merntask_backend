import mongoose from "mongoose";
import bcrypt from "bcrypt"; //dependencia para hashear los passwords

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        require: true,
        trim: true //trim elimina los espacios del inico y del final;
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    token: {
        type: String
    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true //crea dos columnas mas. Una creado y una actualizado
});

// ------> Hasheamos el Password <-------
usuarioSchema.pre("save", async function(next) { // Metodo .pre() realiza antes de () . Metodo next salta la etapa
    if (!this.isModified("password")) {
        next()
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)// this hace referencia al objeto usuario ( por eso no usamos arrow function )
})
// ------> Comprobamos el Password <-------
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password) // compare() metodo que compara y devuelve true o false
}

const Usuario = mongoose.model("Usuario", usuarioSchema) //tenemos disponible el nombre de usuario y su schema, haciendo ref a la variable Usuario
export default Usuario