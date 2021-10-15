//Imports de bibliotecas utilizadas para os endpoints e criação do id com uuidv4;
import express, { Request, Response} from 'express';
import { v4 } from 'uuid';

//Criação da rota
const router = express.Router();

//Schemas para inserção no banco;
import ChecklistModel from '../model/checklist';
import HistoryModel from '../model/history';

//Rota padrão da página inicial;
router.get("/", (req: Request, res: Response) =>{
    res.send("Página principal.") //Enviando uma resposta para saber se está funcionando;
});

/*------------------------------VERIFICAR O HISTÓRICO DE UM FORMULÁRIO PELO SEU ID E DATA PASSADA------------------------------*/
router.get("/history/:_id", async(req: Request, res: Response)=>{

    //Verificando se o id passado existe e armazena em uma variável;
    const form: object = await ChecklistModel.findById(req.params._id);
    
    //Variávem para armazenar todos os objetos histórico;
    const historico: any = await HistoryModel.find({checklist: req.params._id})
    
    //Validação se a checklist exite;
    if (!form){
        return res.status(404).send("Não foi possível encontrar o formulário.");
    };
    
    //Verifica se há algum histórico na checklist passada;
    if(!historico){
        return res.status(400).send("Este formulário ainda não foi respondido.");
    };

    //Recebendo as datas inicial e final pelo usuário (Formato: DD-MM-AA);
    let initial_date: any = req.body.start_date; 
    let final_date: any = req.body.end_date;

    //Splitando a data para eliminar os '-';
    initial_date = initial_date.split('-');
    final_date = final_date.split('-');

    //Transformando a data passada pelo usuário em timestamp (Ano, Mês - 1 porque começa no 0, Dia, Hora, Minuto, Segundo);
    const start_date: any = new Date(initial_date[2], initial_date[1] - 1, initial_date[0], 0, 0, 0); //Conta o dia inicial dês da hora 0;
    const end_date: any = new Date(final_date[2], final_date[1] - 1, final_date[0], 24, 0, 0); //Conta o dia final até as 24 horas do dia passado;

    let contadorRespostas:number = 0; // Variável para consultar se houve mais de um histórico encontrado;
    const historyDeposit: object[] = []; //Array para armazenar os históricos dentro do prazo pesquisado;

    for(let i = 0; i < historico.length; i++){
        //Verificação se o histórico esta no prazo;
        if(historico[i].created_at >= start_date.getTime() && historico[i].created_at <= end_date.getTime() + 99999){
            historyDeposit.push(historico[i]);
            contadorRespostas ++;
        }
    }

    //Respostas do servidor;
    if(contadorRespostas > 0){
        return  res.status(200).send(historyDeposit);
    }

    else{
        return res.status(404).send("Não foi possível encontrar nenhuma resposta nessas datas.");
    }

});

/*------------------------------REGISTRAR UM NOVO FORMULÁRIO------------------------------*/
router.post("/register_checklist", async(req: Request, res: Response) =>{
    let IdForm: string; //Variável utilizada para armazenar os Id criados nessa função

    //Validação se o valor passado no nome é válido;
    if(!req.body.name || req.body.name.length <= 2){
        return res.status(400).send("Nome do formulário inválido!");
    }

    //Validação se os valores passados como itens são válido;
    if(!req.body.items || req.body.items == null){
        return res.status(400).send("Itens do formulário inváilo!");
    }

    const Item: any = {}; //Criação de um objeto para armazenar os itens;

    //Loop utilizado para criar a quantidade de objetos pela quantidade de itens passado pelo usuário;
    for(let i = 0; i < req.body.items.length; i++){
        IdForm = v4(); //Criação de um novo Id para cada item;

        //Adicionando o item passado pelo usuário na chave criada acima
        Item[IdForm] = {
            subject: req.body.items[i]
        }

    }


    IdForm = v4(); //Criando uma Id para a checklist;
    const form: any = new ChecklistModel({_id:IdForm, name:req.body.name, created_at:Date.now(), Items: Item, deleat_at: 0}); //Criação da checklist;
    
    //Salvando a checklist criada no banco e enviando uma resposta ao servidor;
    form.save();
    res.status(200).send(form);
});

/*------------------------------INSERÇÃO DAS RESPOSTAS DO FORMULÁRIO BUSCADO PELO ID------------------------------*/
router.post("/answer/:_id", async(req: Request, res: Response)=>{

    //Verificando se o id passado existe e armazena em uma variável;
    const form: any = await ChecklistModel.findById(req.params._id);

    //Validação se a checklist exite;
    if(!form){
        return res.status(404).send("Não foi possível encontrar o formulário!");
    } 

    //Verifica se a checklist passada não foi removida;
    if(form.deleat_at !== 0){
        return res.status(400).send("Este formulário ja foi removido!");
    }

    //Validação se a answer fornecida não é nula ou seu tamanho menor do que 2 caractéres;
    if(req.body.data == "" || req.body.name.length <= 2){
        return res.status(400).send("Resposta fornecida inválida!");
    }

    let contadorAnswers: number = 0 //Variável para contar a quantidade de respostas passada;
    let data:any = {} //Objeto para criar os dados;

    //Loop para a criação e das answers com os respectivos Id's dos itens da checklist;
    for(const item in form.Items){
        data[item] = {
            answer: req.body.data[contadorAnswers]
        };
        contadorAnswers ++;
    }

    const respostas:any =  new HistoryModel({_id:v4(),checklist: form.id, created_at:Date.now(),data: data}) //Criação do histórico da checklist passada;

    //Salvando o histórico criado no banco e enviando uma resposta ao servidor;
    respostas.save();
    res.status(200).send(respostas);
})

/*------------------------------"REMOVENDO" UM FORMULÁRIO------------------------------*/
router.delete("/remove/:_id",async (req: Request, res: Response) => {

    //Verificando se o id passado existe e armazena em uma variável;
    const form: any = await ChecklistModel.findById(req.params._id);

    //Validação se a checklist exite;
    if(!form){
        res.status(404).send("Formulário não encontrado!");
    }

    //Verifica se a checklist passada já foi removida;
    if(form.deleat_at !== 0){
        return res.status(400).send("Este formulário ja foi removido!");
    }

    form.deleat_at = Date.now(); //Alteração do deleat_at para a data que foi deletado;

    //Salvando a alteração no banco e enviando uma resposta ao servidor;
    form.save();
    res.status(200).send(form);
})

export default router; //Exportando a rota;