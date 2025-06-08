import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();
const listaProdutos = []; // Nosso "banco de dados" em memória

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware para ler cookies

// Configuração da sessão
app.use(session({
    secret: 'chave-secreta-para-produtos', // Troque por uma chave mais segura em produção
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30, // Sessão expira em 30 minutos de inatividade
    }
}));

// Middleware para verificar se o usuário está autenticado
function verificarAutenticacao(req, res, next) {
    if (req.session.usuarioLogado) {
        next(); // Se o usuário está na sessão, continua para a próxima rota
    } else {
        // Se não estiver logado, exibe uma mensagem de erro
        res.status(401).send(`
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Acesso Negado</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">
            </head>
            <body class="bg-light">
                <div class="container mt-5">
                    <div class="alert alert-danger text-center">
                        <h1>Acesso Negado!</h1>
                        <p>Você precisa fazer login para acessar esta página.</p>
                        <a href="/login" class="btn btn-primary mt-3">Fazer Login</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
}

// Rota para a página de login (GET)
app.get('/login', (req, res) => {
    res.send(`
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">
        <title>Login - Cadastro de Produtos</title>
        <style>
            .gradient-custom {
                background: linear-gradient(to right, rgba(37, 117, 252, 1), rgba(106, 17, 203, 1));
            }
        </style>
    </head>
    <body>
        <section class="vh-100 gradient-custom">
            <div class="container py-5 h-100">
                <div class="row d-flex justify-content-center align-items-center h-100">
                    <div class="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div class="card bg-dark text-white" style="border-radius: 1rem;">
                            <div class="card-body p-5 text-center">
                                <div class="mb-md-5 mt-md-4">
                                    <h2 class="fw-bold mb-2 text-uppercase">Sistema de Produtos</h2>
                                    <p class="text-white-50 mb-5">Por favor, entre com seu usuário e senha!</p>
                                    <form method="POST" action="/login">
                                        <div class="form-outline form-white mb-4">
                                            <input type="text" id="usuario" name="usuario" class="form-control form-control-lg" required />
                                            <label class="form-label" for="usuario">Usuário</label>
                                        </div>
                                        <div class="form-outline form-white mb-4">
                                            <input type="password" id="senha" name="senha" class="form-control form-control-lg" required />
                                            <label class="form-label" for="senha">Senha</label>
                                        </div>
                                        <button class="btn btn-outline-light btn-lg px-5" type="submit">Login</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </body>
    </html>
    `);
});

// Rota para processar o login (POST)
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    // Simulação de autenticação (usuário e senha fixos)
    if (usuario === 'admin' && senha === 'admin123') {
        req.session.usuarioLogado = true;
        req.session.nomeUsuario = 'Administrador';
        
        // Define o cookie com a data/hora do último acesso
        const dataHoraAtual = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        res.cookie('ultimoAcesso', dataHoraAtual, { maxAge: 900000, httpOnly: true });

        res.redirect('/produtos'); // Redireciona para a tela de produtos
    } else {
        res.send(`
        <html lang="pt-br">
        <head><title>Erro</title><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"></head>
        <body>
            <div class="container mt-5">
                <div class="alert alert-danger">Usuário ou senha inválidos!</div>
                <a href="/login" class="btn btn-primary">Tentar Novamente</a>
            </div>
        </body>
        </html>
        `);
    }
});

// Rota de Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/login');
    });
});


// Rota para o formulário de cadastro (protegida)
app.get('/cadastro', verificarAutenticacao, (req, res) => {
    res.send(`
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Cadastro de Produtos</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="/produtos">Sistema de Produtos</a>
                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item"><a class="nav-link" href="/produtos">Ver Produtos</a></li>
                        <li class="nav-item active"><a class="nav-link" href="/cadastro">Cadastrar Novo</a></li>
                    </ul>
                    <span class="navbar-text text-white">Bem-vindo, ${req.session.nomeUsuario}!</span>
                    <a href="/logout" class="btn btn-outline-danger ml-3">Sair</a>
                </div>
            </div>
        </nav>
        <div class="container mt-5">
            <h2 class="text-center">Cadastrar Novo Produto</h2>
            <form method="POST" action="/cadastro" class="mt-4 p-4 border rounded bg-light">
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="codigo_barras">Código de Barras</label>
                        <input type="text" class="form-control" id="codigo_barras" name="codigo_barras" required>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="fabricante">Nome do Fabricante</label>
                        <input type="text" class="form-control" id="fabricante" name="fabricante" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="descricao">Descrição do Produto</label>
                    <input type="text" class="form-control" id="descricao" name="descricao" required>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-4">
                        <label for="preco_custo">Preço de Custo (R$)</label>
                        <input type="number" step="0.01" class="form-control" id="preco_custo" name="preco_custo" required>
                    </div>
                    <div class="form-group col-md-4">
                        <label for="preco_venda">Preço de Venda (R$)</label>
                        <input type="number" step="0.01" class="form-control" id="preco_venda" name="preco_venda" required>
                    </div>
                    <div class="form-group col-md-4">
                        <label for="qtd_estoque">Quantidade em Estoque</label>
                        <input type="number" class="form-control" id="qtd_estoque" name="qtd_estoque" required>
                    </div>
                </div>
                 <div class="form-group">
                    <label for="data_validade">Data de Validade</label>
                    <input type="date" class="form-control" id="data_validade" name="data_validade" required>
                </div>
                <button type="submit" class="btn btn-primary">Cadastrar</button>
            </form>
        </div>
    </body>
    </html>
    `);
});

// Rota para processar o cadastro do produto (protegida)
app.post('/cadastro', verificarAutenticacao, (req, res) => {
    const { codigo_barras, descricao, preco_custo, preco_venda, data_validade, qtd_estoque, fabricante } = req.body;
    
    // Adiciona o novo produto à lista
    listaProdutos.push({
        codigo_barras,
        descricao,
        preco_custo,
        preco_venda,
        data_validade,
        qtd_estoque,
        fabricante
    });

    // Redireciona para a página que lista os produtos
    res.redirect('/produtos');
});

// Rota para exibir os produtos cadastrados (protegida)
app.get('/produtos', verificarAutenticacao, (req, res) => {
    const ultimoAcesso = req.cookies.ultimoAcesso || 'Primeiro acesso';

    let tabelaHtml = '';
    if (listaProdutos.length === 0) {
        tabelaHtml = `<tr><td colspan="7" class="text-center">Nenhum produto cadastrado ainda.</td></tr>`;
    } else {
        tabelaHtml = listaProdutos.map(produto => `
            <tr>
                <td>${produto.codigo_barras}</td>
                <td>${produto.descricao}</td>
                <td>${produto.fabricante}</td>
                <td>R$ ${produto.preco_custo}</td>
                <td>R$ ${produto.preco_venda}</td>
                <td>${new Date(produto.data_validade).toLocaleDateString('pt-BR')}</td>
                <td>${produto.qtd_estoque}</td>
            </tr>
        `).join('');
    }

    res.send(`
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Produtos Cadastrados</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <span class="navbar-text text-white-50">
                    Último Acesso: ${ultimoAcesso}
                </span>
                <div class="collapse navbar-collapse justify-content-center">
                    <ul class="navbar-nav">
                        <li class="nav-item active"><a class="nav-link" href="/produtos">Ver Produtos</a></li>
                        <li class="nav-item"><a class="nav-link" href="/cadastro">Cadastrar Novo</a></li>
                    </ul>
                </div>
                <span class="navbar-text text-white mr-3">Bem-vindo, ${req.session.nomeUsuario}!</span>
                <a href="/logout" class="btn btn-outline-danger">Sair</a>
            </div>
        </nav>

        <div class="container mt-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Produtos Cadastrados</h2>
                <a href="/cadastro" class="btn btn-success">Adicionar Novo Produto</a>
            </div>
            <table class="table table-striped table-bordered">
                <thead class="thead-dark">
                    <tr>
                        <th>Cód. Barras</th>
                        <th>Descrição</th>
                        <th>Fabricante</th>
                        <th>Preço Custo</th>
                        <th>Preço Venda</th>
                        <th>Validade</th>
                        <th>Estoque</th>
                    </tr>
                </thead>
                <tbody>
                    ${tabelaHtml}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `);
});

// Página inicial redireciona para o login
app.get('/', (req, res) => {
    res.redirect('/login');
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});