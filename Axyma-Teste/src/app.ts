//Imports de bibliotecas utilizadas para os endpoints e conexão com o bando de dados; 
import express, {Application} from 'express';
import mongoose from 'mongoose';

//Port onde será aberta a aplicação
const PORT:number = 3000;

//Importação da rota criada em outra pasta;
import router from './route/formularios'

//Inicialização da aplicação;
const app: Application = express();
app.use(express.json());

//Utilização das rotas criadas no arquivo ./route/formularios.ts;
app.use('/', router); 

//Conexão com o banco de dados (o banco de dados utilizado foi o MongoDB);
mongoose.connect('mongodb+srv://victormdsp:81005496@cluster0.ziqd8.mongodb.net/Axyme?retryWrites=true&w=majority',() =>{
    console.log("Connected to Database");
})

//Aplicação escutando;
app.listen(PORT, () => console.log("Escutando no porta ",PORT));