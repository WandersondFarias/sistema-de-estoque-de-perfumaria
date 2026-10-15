<div align="center">

# ✦ Essência — Controle de Estoque de Perfumaria

Sistema web **simples, bonito e rápido** para gerenciar o estoque de uma perfumaria: cadastro de produtos, preços, entradas, saídas e histórico completo. Sem instalação, sem servidor, sem dependências.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/Licença-MIT-7c3aed?style=for-the-badge)

</div>

---

## 📸 Preview

> Adicione aqui capturas de tela do projeto (tema claro e escuro).
>
> ```md
> ![Tema claro](./docs/preview-claro.png)
> ![Tema escuro](./docs/preview-escuro.png)
> ```

## ✨ Funcionalidades

- **Cadastro completo de produtos** — nome, marca, categoria, volume (ml), preço de custo, preço de venda, quantidade e estoque mínimo.
- **Editar e excluir** produtos com confirmação de exclusão.
- **Entradas e saídas de estoque** com quantidade, valor unitário e observação.
- **Validação de saída** — impede vender mais do que existe em estoque.
- **Histórico de movimentações** com busca e filtro por entrada/saída.
- **Painel de indicadores** — total de produtos, unidades, valor em estoque e alertas de estoque baixo.
- **Alertas visuais** — situação *Em estoque*, *Estoque baixo* ou *Esgotado* com barra de progresso.
- **Busca, filtros e ordenação** por nome, marca, categoria, situação, preço e quantidade.
- **Modo claro e escuro** — respeita a preferência do sistema e lembra sua escolha.
- **Exportação para CSV** (abre direto no Excel) e **backup/restauração em JSON**.
- **Responsivo** — funciona no computador, tablet e celular.
- **Dados salvos no navegador** via `localStorage` — nada é enviado para servidores.

## 🚀 Como usar

Não é preciso instalar nada.

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# 2. Entre na pasta
cd SEU-REPOSITORIO

# 3. Abra o arquivo no navegador
#    (dê dois cliques em index.html ou use uma extensão como o Live Server)
```

> 💡 Na primeira vez, clique em **Carregar exemplos** para ver o sistema funcionando com produtos de demonstração.

## 🧭 Guia rápido

| Ação | Como fazer |
| --- | --- |
| Adicionar produto | Botão **＋ Novo produto** no topo |
| Editar produto | Botão **✎ Editar** no card do produto |
| Excluir produto | Botão **🗑 Excluir** no card e confirme |
| Registrar entrada | Botão **⬇ Entrada** (compra, reposição, devolução) |
| Registrar saída | Botão **⬆ Saída** (venda, brinde, perda) |
| Ver histórico | Aba **Movimentações** |
| Trocar o tema | Ícone ☀️ / 🌙 no topo |
| Backup e CSV | Botão **⇅ Dados** no topo |

> ℹ️ Ao editar um produto, a quantidade é alterada somente por **entradas e saídas**. Assim o histórico sempre reflete o estoque real.

## 📁 Estrutura do projeto

```
.
├── index.html   # Estrutura da página, modais e formulários
├── style.css    # Estilos, temas claro/escuro e responsividade
├── app.js       # Lógica do sistema (CRUD, movimentações, filtros, backup)
└── README.md    # Documentação
```

## 🛠️ Tecnologias

- **HTML5** — semântica e elemento `<dialog>` para os modais
- **CSS3** — variáveis CSS, Grid, Flexbox e animações
- **JavaScript (ES6+)** — sem frameworks nem bibliotecas
- **localStorage** — persistência de dados no navegador

## 🌐 Publicar no GitHub Pages

1. Envie os arquivos para um repositório no GitHub.
2. Vá em **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**, selecione `main` e a pasta `/ (root)`.
4. Salve. Em instantes o sistema estará online em  
   `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`

## ⚠️ Observações importantes

- Os dados ficam **somente no navegador** em que foram cadastrados. Limpar os dados do navegador apaga o estoque.
- Use **⇅ Dados → Backup completo (JSON)** com frequência para guardar uma cópia de segurança.
- Para usar em mais de um computador, exporte o backup e importe no outro.

## 🗺️ Ideias para o futuro

- [ ] Código de barras / SKU
- [ ] Gráficos de vendas e produtos mais vendidos
- [ ] Controle de fornecedores
- [ ] Relatórios em PDF
- [ ] Sincronização com banco de dados na nuvem
- [ ] Instalação como PWA (funcionar offline no celular)

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Faça um *fork* do projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Faça o commit: `git commit -m "Adiciona minha feature"`
4. Envie: `git push origin minha-feature`
5. Abra um *Pull Request*

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais informações.

## 👤 Autor

Feito com 💜 por **SEU NOME**

- GitHub: [@SEU-USUARIO](https://github.com/SEU-USUARIO)
- LinkedIn: [SEU NOME](https://linkedin.com/in/SEU-PERFIL)

---

<div align="center">

⭐ Se este projeto te ajudou, deixe uma estrela no repositório!

</div>
