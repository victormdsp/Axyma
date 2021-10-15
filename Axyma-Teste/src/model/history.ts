//Importação do moongose para criar os Schemas e o modelo do documento;
import mongoose from 'mongoose';

//Criando o modelo do documento dos Historicos;
interface History{
    _id: string,
    checklist: string,
    created_at: number,
    data: object
}

/*
    type: tipo do dado,
    required: o dado não pode ser nulo,
*/

//Setando as variáveis e criando o Schema do Histórico;
const HistorySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    checklist: {
        type: String,
        required: true
    },
    created_at: {
        type: Number,
        required: true
    },
    data: {
        type: Object,
        required: true
    }
})

//Criando e exportando o modelo do Schema do Histórico;
const HistoryModel = mongoose.model("History", HistorySchema);
export default HistoryModel;