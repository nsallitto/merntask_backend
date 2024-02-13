import mongoose from "mongoose";

const tareaSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        require: true
    },
    descripcion: {
        type: String,
        trim: true,
        require: true
    },
    estado: {
        type: Boolean,
        default: false
    },
    fechaEntrega: {
        type: Date,
        require: true,
        default: Date.now()
    },
    prioridad: {
        type: String,
        require: true,
        enum: ["Baja", "Media", "Alta"] //enum permite solo esos valores
    },
    completado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
    },
    proyecto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proyecto"
    }
}, {
    timestamps: true,
});

const Tarea = mongoose.model("Tarea", tareaSchema);
export default Tarea;