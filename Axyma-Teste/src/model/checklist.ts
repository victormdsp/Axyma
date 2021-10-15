//Importação do moongose para criar os Schemas e o modelo do documento;
import mongoose from "mongoose";

//Criando o modelo do documento das Checklists;
interface Checklist{
    _id: string,
    name: string,
    created_at: number,
    Items: object,
    deleat_at: number
}

//Setando as variáveis e criando o Schema da Checklist;

/*
    type: tipo do dado,
    required: o dado não pode ser nulo,
    immutable: o dado não pode ser mudado após sua criação;
*/
export const ChecklistSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        immutable: true
    },
        
    name: {
        type: String,
        required: true,
        immutable: true
    },

    created_at: { 
        type: Number,
        required: true,
        immutable: true
    },
    Items: {
        type: Object,
        required: true,
        immutable: true
    },

    deleat_at: {
        type: Number,
        default: 0,
    }
})

//Criando e exportando o modelo do Schema da Checklist;
const ChecklistModel = mongoose.model("Checklist", ChecklistSchema);
export default ChecklistModel;