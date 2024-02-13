import mongoose from "mongoose";

const proyectosSchema = mongoose.Schema({
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
    fechaEntrega: {
        type: Date,
        default: Date.now()
    },
    cliente: {
        type: String,
        trim: true,
        require: true
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
    },
    tareas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tarea",
        }
    ],
    colaboradores: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
        },
    ]
},{
    timestamps: true, //Nos crea las columnas de createdat y updateat
})

const Proyecto = mongoose.model("Proyecto", proyectosSchema);
export default Proyecto;
