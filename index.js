import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

const host = "0.0.0.0";
const port = 5000;
let listaProdutos = [];
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "M1nh@Senh@Secret@",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 15,
        httpOnly: true,
        secure: false
    }
}));

app.use(cookieParser());

app.get("/", verificarAutenticacao, (req, res) => {
    const ultimoLogin = req.cookies.ultimoLogin;
    const nomeUsuario = req.session.usuario;

    res.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Gestão de Produtos</title>
            </head>
            <body>
                <header class="bg-light py-4 border-bottom bg-dark text-white">
                    <div class="container d-flex flex-column flex-md-row align-items-center justify-content-between">
                        <h1 class="mb-3">S.G.P</h1>
                        ${nomeUsuario ? `<p class='text-white'>Usuário: ${nomeUsuario}</p>` : ""}
                        <nav>
                            <a href="/cadastroProduto" class="btn btn-primary me-2">Cadastro de Produtos</a>
                            <a href="/listaProdutos" class="btn btn-secondary me-2">Lista de Produtos</a>
                            <a href="/logout" class="btn btn-danger">Sair</a>
                        </nav>
                    </div>
                    <div class="container mt-2 text-end">
                        ${ultimoLogin ? "<p class='text-white'>Último login: " + ultimoLogin + "</p>" : ""}
                    </div>
                </header>
                <div class="container mt-5">
                    <h1 class="text-center">Bem-vindo ao Sistema de Gestão de Produtos</h1>
                </div>
            </body>
        </html>
    `);
});


app.get("/cadastroProduto", verificarAutenticacao, (req, res) => {
    res.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Cadastro de Produtos</title>
            </head>
            <body>
                    <div class="container mt-5">
                        <form method="POST" action="/cadastroProduto" class="row g-3 border p-3" novalidate>
                            <fieldset><legend class="text-center">Cadastro de Produto</legend></fieldset>

                            <div class="col-md-4">
                                <label for="codigoBarras" class="form-label">Código de Barras</label>
                                <input type="text" class="form-control" id="codigoBarras" name="codigoBarras">
                            </div>

                            <div class="col-md-8">
                                <label for="descricao" class="form-label">Descrição</label>
                                <input type="text" class="form-control" id="descricao" name="descricao">
                            </div>

                            <div class="col-md-4">
                                <label for="precoCusto" class="form-label">Preço de Custo</label>
                                <input type="number" step="0.01" class="form-control" id="precoCusto" name="precoCusto">
                            </div>

                            <div class="col-md-4">
                                <label for="precoVenda" class="form-label">Preço de Venda</label>
                                <input type="number" step="0.01" class="form-control" id="precoVenda" name="precoVenda">
                            </div>

                            <div class="col-md-4">
                                <label for="dataValidade" class="form-label">Data de Validade</label>
                                <input type="date" class="form-control" id="dataValidade" name="dataValidade">
                            </div>

                            <div class="col-md-4">
                                <label for="quantidade" class="form-label">Quantidade em Estoque</label>
                                <input type="number" class="form-control" id="quantidade" name="quantidade">
                            </div>

                            <div class="col-md-8">
                                <label for="fabricante" class="form-label">Nome do Fabricante</label>
                                <input type="text" class="form-control" id="fabricante" name="fabricante">
                            </div>

                            <div class="col-12">
                                <button class="btn btn-primary" type="submit">Cadastrar</button>
                                <a class="btn btn-secondary" href="/">Voltar</a>
                            </div>
                        </form>
                    </div>
            </body>
        </html>
    `);
    res.end();
});

app.post("/cadastroProduto", verificarAutenticacao, (req, res) => {

    var codigoBarras = req.body.codigoBarras;
    var descricao = req.body.descricao;
    var precoCusto = req.body.precoCusto;
    var precoVenda = req.body.precoVenda;
    var dataValidade = req.body.dataValidade;
    var quantidade = req.body.quantidade;
    var fabricante = req.body.fabricante;

    if (codigoBarras && descricao && precoCusto && precoVenda && dataValidade && quantidade && fabricante) {
        listaProdutos.push({
            codigoBarras,
            descricao,
            precoCusto,
            precoVenda,
            dataValidade,
            quantidade,
            fabricante
        });
        res.redirect("/listaProdutos");
    } else {
        let conteudo = `
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Cadastro de Produtos</title>
            </head>
            <body>
                    <div class="container mt-5">
                        <form method="POST" action="/cadastroProduto" class="row g-3 border p-3" novalidate>
                            <fieldset><legend class="text-center">Cadastro de Produto</legend></fieldset>

                            <div class="col-md-4">
                                <label for="codigoBarras" class="form-label">Código de Barras</label>
                                <input type="text" class="form-control" id="codigoBarras" name="codigoBarras" value="${codigoBarras || ''}">
                                ${!codigoBarras ? '<span class="text-danger">Informe o código de barras</span>' : ''}
                            </div>

                            <div class="col-md-8">
                                <label for="descricao" class="form-label">Descrição</label>
                                <input type="text" class="form-control" id="descricao" name="descricao" value="${descricao || ''}">
                                ${!descricao ? '<span class="text-danger">Informe a descrição</span>' : ''}
                            </div>

                            <div class="col-md-4">
                                <label for="precoCusto" class="form-label">Preço de Custo</label>
                                <input type="number" step="0.01" class="form-control" id="precoCusto" name="precoCusto" value="${precoCusto || ''}">
                                ${!precoCusto ? '<span class="text-danger">Informe o preço de custo</span>' : ''}
                            </div>

                            <div class="col-md-4">
                                <label for="precoVenda" class="form-label">Preço de Venda</label>
                                <input type="number" step="0.01" class="form-control" id="precoVenda" name="precoVenda" value="${precoVenda || ''}">
                                ${!precoVenda ? '<span class="text-danger">Informe o preço de venda</span>' : ''}
                            </div>

                            <div class="col-md-4">
                                <label for="dataValidade" class="form-label">Data de Validade</label>
                                <input type="date" class="form-control" id="dataValidade" name="dataValidade" value="${dataValidade || ''}">
                                ${!dataValidade ? '<span class="text-danger">Informe a data de validade</span>' : ''}
                            </div>

                            <div class="col-md-4">
                                <label for="quantidade" class="form-label">Quantidade em Estoque</label>
                                <input type="number" class="form-control" id="quantidade" name="quantidade" value="${quantidade || ''}">
                                ${!quantidade ? '<span class="text-danger">Informe a quantidade</span>' : ''}
                            </div>

                            <div class="col-md-8">
                                <label for="fabricante" class="form-label">Nome do Fabricante</label>
                                <input type="text" class="form-control" id="fabricante" name="fabricante" value="${fabricante || ''}">
                                ${!fabricante ? '<span class="text-danger">Informe o nome do fabricante</span>' : ''}
                            </div>

                            <div class="col-12">
                                <button class="btn btn-primary" type="submit">Cadastrar</button>
                                <a class="btn btn-secondary" href="/">Voltar</a>
                            </div>
                        </form>
                    </div>
            </body>
        </html>`;
        res.send(conteudo);
        res.end();
    }
});

app.get("/listaProdutos", verificarAutenticacao, (req, res) => {
    let conteudo = `
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Lista de Produtos</title>
            </head>
            <body>
                    <div class="container mt-5">
                        <h3 class="text-center mb-3">Produtos Cadastrados</h3>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Código de Barras</th>
                                    <th>Descrição</th>
                                    <th>Preço de Custo</th>
                                    <th>Preço de Venda</th>
                                    <th>Validade</th>
                                    <th>Qtd</th>
                                    <th>Fabricante</th>
                                </tr>
                            </thead>
                            <tbody>`;

                        for (let prod of listaProdutos) {
                            conteudo += `
                                <tr>
                                    <td>${prod.codigoBarras}</td>
                                    <td>${prod.descricao}</td>
                                    <td>R$ ${parseFloat(prod.precoCusto).toFixed(2)}</td>
                                    <td>R$ ${parseFloat(prod.precoVenda).toFixed(2)}</td>
                                    <td>${prod.dataValidade}</td>
                                    <td>${prod.quantidade}</td>
                                    <td>${prod.fabricante}</td>
                                </tr>`;
                        }

                        conteudo += `</tbody>
                                        </table>
                                        <a class="btn btn-secondary" href="/cadastroProduto">Cadastrar um produto</a>
                    </div>
            </body>
        </html>`;

    res.send(conteudo);
});

app.get("/login", (req, res) => {
    res.send(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet">
                <title>Login do Sistema</title>
                <style>
                    body {
                        background-color: #F1FFFA;
                    }
                    #login {
                        margin-top: 100px;
                    }
                </style>
            </head>
            <body>
                <div id="login">
                    <h3 class="text-center text-black pt-5">Acessar o Sistema</h3>
                    <div class="container">
                        <div class="row justify-content-center align-items-center">
                            <div class="col-md-6">
                                <div class="col-md-12">
                                    <form action="/login" method="post">
                                        <h3 class="text-center text-info">Login</h3>
                                        <div class="form-group">
                                            <label class="text-info">Usuário:</label><br>
                                            <input type="text" name="usuario" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label class="text-info">Senha:</label><br>
                                            <input type="password" name="senha" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <input type="submit" class="btn btn-info btn-md" value="Entrar">
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `);
});

app.post("/login", (req, res) => {
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    if (usuario === "admin" && senha === "123") {
        req.session.logado = true;
        req.session.usuario = usuario; 
        const agora = new Date();
        res.cookie('ultimoLogin', agora.toLocaleString(), { maxAge: 1000 * 60 * 60 * 24 * 30 });
        res.redirect("/");
    }
    else {
        res.send(`  <html lang="pt-br">
                        <head>
                            <meta charset="UTF-8">
                            <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet">
                            <title>Login do Sistema</title>
                             <style>
                                body {
                                    background-color: #F1FFFA;
                                }
                                #login {
                                    margin-top: 100px;
                                }
                            </style>
                        </head>
                        <body>
                            <div id="login">
                                <h3 class="text-center text-black pt-5">Acessar o Sistema</h3>
                                <div class="container">
                                    <div class="row justify-content-center align-items-center">
                                        <div class="col-md-6">
                                            <div class="col-md-12">
                                                <form action="/login" method="post">
                                                    <h3 class="text-center text-info">Login</h3>
                                                    <div class="form-group">
                                                        <label class="text-info">Usuário:</label><br>
                                                        <input type="text" name="usuario" class="form-control">
                                                    </div>
                                                    <div class="form-group">
                                                        <label class="text-info">Senha:</label><br>
                                                        <input type="password" name="senha" class="form-control">
                                                    </div>
                                                    <div class="form-group">
                                                        <input type="submit" class="btn btn-info btn-md" value="Entrar">
                                                    </div>
                                                    <span class="text-danger">Usuario ou senha errados!</span>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </body>
                    </html>`);
    }
});

function verificarAutenticacao(req, res, next) {
    if (req.session.logado){
        next();
    } 
    else{
        res.redirect("/login");
    }
}

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

app.listen(port, host, () => {
    console.log(`Servidor em execução em http://${host}:${port}/`);
});