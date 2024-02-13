import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"
import Tarea from "../models/Tarea.js";


const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({ //!find() por defecto tiene $and como condicion por eso cambiamos a $or
        '$or': [
            { creador: { $in: req.usuario } },
            { colaboradores: { $in: req.usuario } }
        ]
    }).select('-tareas');
    res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id
    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.log(error);
    }
}

const obtenerProyecto = async (req, res) => {

    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)
        .populate({path: "tareas", populate: {path: "completado", select: "nombre"}})
        .populate("colaboradores", "nombre email") //!cuando es una consulta cruzada no sirve el select()

    if (!proyecto) {
        const error = new Error("No Encontrado")
        return res.status(401).json({ msg: error.message })
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador =>
        colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("No tienes los Permisos")
        return res.status(401).json({ msg: error.message })
    }
    res.json(proyecto)
}

const editarProyecto = async (req, res) => {

    const { id } = req.params; //obtengo el id del proyecto en el que estoy
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error("No Encontrado")
        return res.status(401).json({ msg: error.message })
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los Permisos")
        return res.status(401).json({ msg: error.message })
    }
    proyecto.nombre = req.body.nombre || proyecto.nombre //El or lo utilizamos por si no se pasa
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente
    try {
        const proyectoAlmacenado = await proyecto.save()
        return res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error);
    }
}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error("No Encontrado");
        return res.status(401).json({ msg: error.message });
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los Permisos")
        return res.status(401).json({ msg: error.message })
    }
    try {
        await proyecto.deleteOne();
        res.json({ msg: "Proyecto Eliminado" })
    } catch (error) {
        console.log(error);
    }
}
const buscarColaborador = async (req, res) => {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email }).select("email nombre _id");

    if (!usuario) {
        return res.status(404).json({ msg: "Usuario no encontrado" })
    }
    res.json(usuario)
}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    if (!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los permisos")
        return res.status(402).json({ msg: error.message })
    }
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email }).select("email nombre _id");
    if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ msg: error.message })
    }
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error("El Creador del proyecto no puede ser Colaborador");
        return res.status(404).json({ msg: error.message })
    }
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error("El usuario ya es colaborador de este proyecto");
        return res.status(404).json({ msg: error.message })
    }
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({ msg: "Colaborador agregado correctamente" })



    //TODO:---------seguir con las validaciones--------------------
    //*-------------- IMPORTANT---------------------------
    //!-------------------WARNING---------------------

}
const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    if (!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los permisos para eliminar colaborador")
        return res.status(402).json({ msg: error.message })
    }

    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({ msg: "Colaborador eliminado correctamente" })
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
}