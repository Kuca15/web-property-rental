import { PORT } from "./env";
import {
  addProperty,
  connect,
  getProperties,
  getPropertiesWithFilter,
  login,
  reset,
  updatePropertyState,
  addInterest,
} from "./db";
import express from "express";
import http from "http";
import path from "path";
import { genSaltSync, hashSync, compareSync } from "bcryptjs";

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, "../public")));

// REQUISIÇÕES BÁSICAS
app.get("/properties", async (req, res) => {
  const filter = req.query;
  if (filter) {
    const properties = await getPropertiesWithFilter(filter);
    res.json(properties);
  } else {
    const properties = await getProperties();
    res.json(properties);
  }
});

// REQUISICOES PARA UM CORRETOR
// requisição para aprovar login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    const l = await login(username, password);
    res.json(!!l);
  } else {
    res.json("Problema ao efetuar login.");
  }
});

// requisição para fazer troca de senha
app.post("/reset", async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    const l = await reset(username, password);
    res.json(l);
  } else {
    res.json("Problema ao atualizar senha.");
  }
});

// requisição para cadastrar imóvel
app.post("/property", async (req, res) => {
  const {
    nrInscricao,
    img,
    endereco,
    tipo,
    nrDormitorios,
    nrBanheiros,
    nrVagas,
    valor,
  } = req.body;
  if (
    nrInscricao &&
    img &&
    endereco &&
    tipo &&
    nrDormitorios &&
    nrBanheiros &&
    nrVagas &&
    valor
  ) {
    const p = await addProperty(
      nrInscricao,
      img,
      endereco,
      tipo,
      nrDormitorios,
      nrBanheiros,
      nrVagas,
      valor
    );
    if (p) {
      res.json(!!p);
    } else {
      res.json("Já existe um imóvel com este número de inscrição.");
    }
  } else {
    res.json("Problema ao inserir imóvel.");
  }
});

// requisição para alterar situação de um imóvel
app.post("/update", async (req, res) => {
  const { nrInscricao, situacao } = req.body;
  if (nrInscricao && situacao) {
    const item = await updatePropertyState(nrInscricao, situacao);
    res.json(item);
  } else {
    res.json("Problema ao atualizar imóvel.");
  }
});

// REQUISICOES PARA UM INQUILINO
// requisição para manifestar interesse em um imóvel
app.post("/interest", async (req, res) => {
  const { nome, telefone, nr_inscricao } = req.body;
  if (nr_inscricao && telefone && nome) {
    const item = await addInterest(nr_inscricao, nome, telefone);
    res.json(item);
  } else {
    res.json("Problema ao inscrever interesse.");
  }
});

const server = http.createServer(app);
connect();
server.listen(PORT, () => console.log(`Rodando em ${PORT}`));
